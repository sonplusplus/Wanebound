import units from '../../../data/units.json';
import skills from '../../../data/skills.json';
import hazards from '../../../data/hazards.json';
import { loadGameData } from './data.js';

export const defaultGameData = loadGameData({ units, skills, hazards });
