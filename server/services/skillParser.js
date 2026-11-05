/**
 * Parse YAML frontmatter and extract markdown body, parameters, and metadata.
 */
export function parseSkillContent(rawContent, defaultName = 'skill') {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      metadata: {
        name: defaultName,
        category: 'General',
        trigger: 'on_demand',
        description: `Automated skill runbook for ${defaultName}`,
        parameters: [],
        version: '1.0.0'
      },
      rawMarkdown: ''
    };
  }

  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  
  // If NO frontmatter exists: Smart fallback from first heading & paragraphs
  if (!match) {
    let fallbackTitle = defaultName;
    let fallbackDesc = '';
    const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    for (const line of lines) {
      if (line.startsWith('#') && (!fallbackTitle || fallbackTitle === defaultName)) {
        fallbackTitle = line.replace(/^#+\s*/, '');
      } else if (!line.startsWith('#') && !line.startsWith('```') && !fallbackDesc) {
        fallbackDesc = line;
      }
      if (fallbackTitle && fallbackDesc) break;
    }

    return {
      metadata: {
        name: defaultName,
        filename: `${defaultName}.md`,
        category: 'General',
        trigger: 'on_demand',
        description: fallbackDesc || `Automated skill runbook for ${defaultName}`,
        parameters: [],
        version: '1.0.0'
      },
      rawMarkdown: rawContent.trim()
    };
  }

  const rawFm = match[1];
  const rawMarkdown = rawContent.slice(match[0].length).trim();
  const fm = {};
  const parameters = [];

  const lines = rawFm.split(/\r?\n/);
  let inParameters = false;
  let currentParam = null;
  let multiLineKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // Detect parameters section
    if (line.match(/^parameters:/i)) {
      inParameters = false;
      multiLineKey = null;
      inParameters = true;
      continue;
    }

    // Top-level keys outside parameters
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      inParameters = false;
      multiLineKey = null;
      const colonIdx = line.indexOf(':');
      if (colonIdx > -1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        let val = line.slice(colonIdx + 1).trim();
        if (val === '>-' || val === '|' || val === '>' || val === '|-') {
          multiLineKey = key;
          fm[key] = '';
        } else {
          fm[key] = val.replace(/^['"]|['"]$/g, '').trim();
        }
      }
      continue;
    }

    // Accumulate multiline values (like description: >-)
    if (multiLineKey && (line.startsWith(' ') || line.startsWith('\t'))) {
      const part = line.trim();
      fm[multiLineKey] = fm[multiLineKey] ? `${fm[multiLineKey]} ${part}` : part;
      continue;
    }

    // Parameter sub-fields parsing
    if (inParameters) {
      const paramNameMatch = line.match(/^\s{2,4}([a-zA-Z0-9_-]+):/);
      if (paramNameMatch) {
        currentParam = { name: paramNameMatch[1], type: 'string', defaultValue: '', description: '' };
        parameters.push(currentParam);
        continue;
      }

      if (currentParam) {
        const propMatch = line.match(/^\s{4,8}([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (propMatch) {
          const propKey = propMatch[1].trim().toLowerCase();
          const propVal = propMatch[2].trim().replace(/^['"]|['"]$/g, '');
          if (propKey === 'type') currentParam.type = propVal;
          if (propKey === 'default') currentParam.defaultValue = propVal;
          if (propKey === 'description') currentParam.description = propVal;
        }
      }
    }
  }

  const name = (fm.name || defaultName).trim();
  const category = (fm.category || 'General').trim();
  const trigger = (fm.trigger === 'always_on') ? 'always_on' : 'on_demand';
  const description = (fm.description || `Skill runbook for ${name}`).trim();
  const version = (fm.version || '1.0.0').trim();

  return {
    metadata: {
      name,
      filename: `${name}.md`,
      category,
      trigger,
      description,
      parameters,
      version
    },
    rawMarkdown
  };
}
