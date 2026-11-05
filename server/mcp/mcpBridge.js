#!/usr/bin/env node
import readline from 'node:readline';
import { listSkills, getSkillByName } from '../services/skillService.js';
import { connectDB } from '../config/db.js';

// Connect DB in background
connectDB().catch(() => {});

const TOOLS = [
  {
    name: 'list_skills',
    description: 'Lists all available agent skills, their category, triggers, and descriptions from the database.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional category filter (e.g. Coding, DevOps, Security)' }
      }
    }
  },
  {
    name: 'get_skill',
    description: 'Fetches the complete markdown instructions and runbook of a specific skill by name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Exact name of the skill (e.g. k8s-pod-diagnostics)' }
      },
      required: ['name']
    }
  },
  {
    name: 'search_skills',
    description: 'Search skills by keyword or intent in titles and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or query' }
      },
      required: ['query']
    }
  }
];

async function handleRequest(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'synexan-agent-skill-hub', version: '1.0.0' }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null;
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;

    if (name === 'list_skills') {
      const skills = await listSkills({ category: args?.category });
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                skills.map(s => ({
                  name: s.name,
                  category: s.category,
                  description: s.description,
                  trigger: s.trigger,
                  filename: s.filename
                })),
                null,
                2
              )
            }
          ]
        }
      };
    }

    if (name === 'get_skill') {
      const skill = await getSkillByName(args.name);
      if (!skill) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Skill '${args.name}' not found.` }],
            isError: true
          }
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: skill.content }]
        }
      };
    }

    if (name === 'search_skills') {
      const skills = await listSkills({ query: args.query });
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                skills.map(s => ({
                  name: s.name,
                  category: s.category,
                  description: s.description
                })),
                null,
                2
              )
            }
          ]
        }
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Tool ${name} not found` }
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method ${method} not supported` }
  };
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', async line => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const res = await handleRequest(req);
    if (res) {
      process.stdout.write(JSON.stringify(res) + '\n');
    }
  } catch (err) {
    process.stderr.write(`MCP frame error: ${err.message}\n`);
  }
});
