import fs from 'node:fs';
import path from 'node:path';
import { SkillModel } from '../models/Skill.js';
import { getDBStatus } from '../config/db.js';
import { config } from '../config/env.js';
import { parseSkillContent } from './skillParser.js';

function ensureSkillsDir() {
  if (!fs.existsSync(config.skillsDir)) {
    fs.mkdirSync(config.skillsDir, { recursive: true });
  }
}

/**
 * Scan and return skills from local filesystem.
 */
export function getLocalSkills() {
  ensureSkillsDir();
  const entries = fs.readdirSync(config.skillsDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    let filePath = null;
    let defaultName = entry.name;

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      filePath = path.join(config.skillsDir, entry.name);
      defaultName = path.basename(entry.name, path.extname(entry.name));
    } else if (entry.isDirectory()) {
      const candidate = path.join(config.skillsDir, entry.name, 'SKILL.md');
      if (fs.existsSync(candidate)) {
        filePath = candidate;
        defaultName = entry.name;
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const { metadata, rawMarkdown } = parseSkillContent(raw, defaultName);
        skills.push({
          id: metadata.name,
          name: metadata.name,
          filename: metadata.filename,
          category: metadata.category,
          trigger: metadata.trigger,
          description: metadata.description,
          parameters: metadata.parameters,
          content: raw,
          rawMarkdown: rawMarkdown,
          version: metadata.version,
          updatedAt: fs.statSync(filePath).mtime
        });
      } catch (err) {
        console.error(`Error reading skill file ${filePath}:`, err.message);
      }
    }
  }

  return skills;
}

/**
 * List all skills with optional category or search query.
 */
export async function listSkills({ category, query } = {}) {
  const { connected } = getDBStatus();

  let skills = [];

  if (connected) {
    try {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (query) {
        filter.$or = [
          { name: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') }
        ];
      }
      skills = await SkillModel.find(filter).sort({ updatedAt: -1 }).lean();
      // If MongoDB is connected but empty, sync local skills into it!
      if (skills.length === 0 && !query && (!category || category === 'All')) {
        const local = getLocalSkills();
        if (local.length > 0) {
          console.log(`📥 [MongoDB Sync] Importing ${local.length} existing local skills into MongoDB...`);
          for (const item of local) {
            await SkillModel.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true });
          }
          skills = await SkillModel.find({}).sort({ updatedAt: -1 }).lean();
        }
      }
    } catch (err) {
      console.warn('MongoDB query failed, falling back to local files:', err.message);
      skills = getLocalSkills();
    }
  } else {
    skills = getLocalSkills();
  }

  // Filter in memory for local mode
  if (!connected) {
    if (category && category !== 'All') {
      skills = skills.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      skills = skills.filter(s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
    }
  }

  return skills;
}

/**
 * Get a single skill by name.
 */
export async function getSkillByName(name) {
  const { connected } = getDBStatus();
  if (connected) {
    try {
      const skill = await SkillModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
      if (skill) {
        // Increment invocation stats
        skill.stats.invocations += 1;
        skill.stats.lastInvokedAt = new Date();
        await skill.save();
        return skill.toObject();
      }
    } catch (err) {
      console.warn('MongoDB getSkillByName failed:', err.message);
    }
  }

  const local = getLocalSkills();
  return local.find(s => s.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Create or save a skill (accepts raw markdown).
 */
export async function saveSkill({ rawContent, filename, categoryOverride, triggerOverride }) {
  ensureSkillsDir();
  const defaultName = filename ? path.basename(filename, path.extname(filename)) : 'new-skill';
  const { metadata, rawMarkdown } = parseSkillContent(rawContent, defaultName);

  if (categoryOverride) metadata.category = categoryOverride;
  if (triggerOverride) metadata.trigger = triggerOverride;

  const targetFilename = `${metadata.name}.md`;
  const filePath = path.join(config.skillsDir, targetFilename);

  // Write file to disk cache
  fs.writeFileSync(filePath, rawContent, 'utf8');

  const { connected } = getDBStatus();
  if (connected) {
    try {
      const doc = await SkillModel.findOneAndUpdate(
        { name: metadata.name },
        {
          ...metadata,
          content: rawContent,
          rawMarkdown: rawMarkdown
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return doc.toObject();
    } catch (err) {
      console.error('Failed to save to MongoDB:', err.message);
    }
  }

  return {
    id: metadata.name,
    ...metadata,
    content: rawContent,
    rawMarkdown,
    updatedAt: new Date()
  };
}

/**
 * Delete a skill safely with exact verification.
 */
export async function deleteSkillByName(name) {
  ensureSkillsDir();
  const { connected } = getDBStatus();

  let deleted = false;

  if (connected) {
    try {
      const res = await SkillModel.deleteOne({ name: new RegExp(`^${name}$`, 'i') });
      if (res.deletedCount > 0) deleted = true;
    } catch (err) {
      console.error('Failed to delete from MongoDB:', err.message);
    }
  }

  // Remove from filesystem
  const directFile = path.join(config.skillsDir, `${name}.md`);
  if (fs.existsSync(directFile)) {
    fs.unlinkSync(directFile);
    deleted = true;
  }
  const folderPath = path.join(config.skillsDir, name);
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    deleted = true;
  }

  return deleted;
}
