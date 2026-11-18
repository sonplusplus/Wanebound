import { z } from 'zod';

export const elementSchema = z.enum([
  'metal',
  'wood',
  'water',
  'fire',
  'earth',
]);
export const roleSchema = z.enum([
  'tank',
  'warrior',
  'archer',
  'mage',
  'support',
]);
const idSchema = z.string().regex(/^[a-z][a-z0-9_]*$/);
const positive = z.number().finite().positive();
const fraction = z.number().finite().min(0).max(1);
const areaSchema = z.union([
  z.literal('target'),
  z.object({ radius: positive, around: z.enum(['target', 'self']) }).strict(),
]);

export const effectSchema = z.discriminatedUnion('type', [
  z
    .object({ type: z.literal('damage'), mult: positive, area: areaSchema })
    .strict(),
  z
    .object({
      type: z.literal('heal'),
      pct: fraction,
      target: z.enum(['lowest_ally', 'all_allies', 'self']),
    })
    .strict(),
  z
    .object({ type: z.literal('shield'), pct: fraction, duration: positive })
    .strict(),
  z
    .object({ type: z.literal('taunt'), duration: positive, radius: positive })
    .strict(),
  z
    .object({
      type: z.literal('slow'),
      pct: fraction,
      duration: positive,
      area: areaSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('stat_mod'),
      stat: z.enum(['atk', 'def', 'spd', 'range', 'aspd']),
      pct: z.number().finite(),
      duration: positive.optional(),
    })
    .strict(),
  z.object({ type: z.literal('damage_bonus'), pct: fraction }).strict(),
  z
    .object({ type: z.literal('basic_damage_reduction'), pct: fraction })
    .strict(),
]);

export const unitSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    element: elementSchema,
    role: roleSchema,
    rarity: z.enum(['R', 'SR', 'SSR', 'UR']),
    stats: z
      .object({
        hp: positive,
        atk: positive,
        def: z.number().finite().nonnegative(),
        spd: positive,
        range: positive,
        aspd: positive,
      })
      .strict(),
    passive: idSchema,
    active: idSchema,
    art: z
      .object({
        portrait: z.string().min(1),
        battle: z.string().min(1),
        icon: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const skillSchema = z
  .object({
    id: idSchema,
    kind: z.enum(['active', 'passive']),
    name: z.string().min(1),
    trigger: z
      .object({
        when: z.enum([
          'always',
          'self_hp_below',
          'target_hp_below',
          'interval',
          'adjacent_enemies_min',
        ]),
        value: positive.optional(),
        radius: positive.optional(),
      })
      .strict()
      .optional(),
    effects: z.array(effectSchema).min(1),
    vfx: idSchema.optional(),
  })
  .strict();

export const hazardSchema = z
  .object({
    id: idSchema,
    element: elementSchema,
    name: z.string().min(1),
    vfx: idSchema.optional(),
    warnOverlay: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    activeOverlay: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    trail: z.enum(['slash', 'vine', 'ripple', 'scorch', 'crack']).optional(),
    effect: z.discriminatedUnion('type', [
      z
        .object({ type: z.literal('damage_max_hp_per_second'), pct: fraction })
        .strict(),
      z
        .object({
          type: z.literal('stat_mod'),
          stat: z.enum(['spd']),
          pct: z.number().finite().min(-1).max(0),
        })
        .strict(),
      z
        .object({
          type: z.literal('energy_gain_mod'),
          pct: z.number().finite().min(-1).max(0),
        })
        .strict(),
      z
        .object({
          type: z.literal('range_mod'),
          amount: z.number().int().negative(),
          min: positive,
        })
        .strict(),
    ]),
  })
  .strict();

export const vfxSchema = z
  .object({
    id: idSchema,
    element: elementSchema,
    layers: z
      .array(
        z
          .object({
            type: z.literal('particles'),
            count: z.number().int().min(1).max(300),
            shape: z.enum(['diamond', 'leaf', 'drop', 'flame', 'shard']),
            speed: z.tuple([positive, positive]),
            life: positive,
            color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
            blend: z.literal('add'),
          })
          .strict(),
      )
      .min(1),
    telegraph: z
      .object({
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        duration: positive,
      })
      .strict(),
  })
  .strict();

export type Element = z.infer<typeof elementSchema>;
export type Role = z.infer<typeof roleSchema>;
export type UnitDef = z.infer<typeof unitSchema>;
export type SkillDef = z.infer<typeof skillSchema>;
export type HazardDef = z.infer<typeof hazardSchema>;
export type VfxDef = z.infer<typeof vfxSchema>;

export function loadVfxData(
  input: unknown,
  skills: SkillDef[],
  hazards: HazardDef[],
): VfxDef[] {
  const vfx = uniqueIds(z.array(vfxSchema).parse(input), 'vfx');
  const byId = new Map(vfx.map((item) => [item.id, item]));
  for (const skill of skills)
    if (skill.vfx && !byId.has(skill.vfx))
      throw new Error(`Missing VFX for skill ${skill.id}`);
  for (const hazard of hazards)
    if (hazard.vfx && !byId.has(hazard.vfx))
      throw new Error(`Missing VFX for hazard ${hazard.id}`);
  return vfx;
}

function uniqueIds<T extends { id: string }>(items: T[], label: string): T[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
  return items;
}

export interface GameData {
  units: UnitDef[];
  skills: SkillDef[];
  hazards: HazardDef[];
}

export function loadGameData(input: {
  units: unknown;
  skills: unknown;
  hazards: unknown;
}): GameData {
  const units = uniqueIds(z.array(unitSchema).parse(input.units), 'unit');
  const skills = uniqueIds(z.array(skillSchema).parse(input.skills), 'skill');
  const hazards = uniqueIds(
    z.array(hazardSchema).parse(input.hazards),
    'hazard',
  );
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  for (const unit of units) {
    if (skillById.get(unit.passive)?.kind !== 'passive')
      throw new Error(`Invalid passive for ${unit.id}: ${unit.passive}`);
    if (skillById.get(unit.active)?.kind !== 'active')
      throw new Error(`Invalid active for ${unit.id}: ${unit.active}`);
  }
  for (const element of elementSchema.options) {
    if (hazards.filter((hazard) => hazard.element === element).length !== 1) {
      throw new Error(`Expected exactly one hazard for ${element}`);
    }
  }
  return { units, skills, hazards };
}
