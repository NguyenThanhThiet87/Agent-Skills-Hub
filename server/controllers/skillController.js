import { listSkills, getSkillByName, saveSkill, deleteSkillByName } from '../services/skillService.js';
import { getDBStatus } from '../config/db.js';

export async function getAllSkills(req, res) {
  try {
    const { category, q } = req.query;
    const skills = await listSkills({ category, query: q });
    const status = getDBStatus();
    res.json({
      success: true,
      storageMode: status.mode,
      count: skills.length,
      data: skills
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getOneSkill(req, res) {
  try {
    const { name } = req.params;
    const skill = await getSkillByName(name);
    if (!skill) {
      return res.status(404).json({ success: false, error: `Skill '${name}' not found.` });
    }
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadOrSaveSkill(req, res) {
  try {
    let rawContent = '';
    let filename = '';

    if (req.file) {
      rawContent = req.file.buffer.toString('utf8');
      filename = req.file.originalname;
    } else if (req.body.content) {
      rawContent = req.body.content;
      filename = req.body.filename || req.body.name || 'custom-skill.md';
    } else {
      return res.status(400).json({ success: false, error: 'No skill content or file provided.' });
    }

    const { category, trigger } = req.body;
    const saved = await saveSkill({
      rawContent,
      filename,
      categoryOverride: category,
      triggerOverride: trigger
    });

    res.status(201).json({
      success: true,
      message: `Skill '${saved.name}' successfully saved!`,
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function removeSkill(req, res) {
  try {
    const { name } = req.params;
    const { confirmation } = req.body;

    const expected = `delete ${name}`;
    if (!confirmation || confirmation.trim() !== expected) {
      return res.status(400).json({
        success: false,
        error: `Confirmation mismatch. You must type exactly '${expected}' to delete.`
      });
    }

    const deleted = await deleteSkillByName(name);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Skill '${name}' not found or already deleted.` });
    }

    res.json({
      success: true,
      message: `Skill '${name}' has been permanently deleted and decoupled from all Agent runtimes.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getSystemHealth(req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: getDBStatus()
  });
}
