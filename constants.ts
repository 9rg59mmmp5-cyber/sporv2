
import { WorkoutDay } from './types';

export const DEFAULT_PROGRAM: WorkoutDay[] = [
  {
    id: 'ppl-push-default',
    name: 'Gün 1: İtiş (Göğüs & Omuz & Triceps)',
    exercises: [
      { id: 'bp-def', name: 'Bench Press', targetSets: '3x8-10', targetWeight: '60 kg' },
      { id: 'ohp-def', name: 'Overhead Press', targetSets: '3x8-10', targetWeight: '35 kg' },
      { id: 'idp-def', name: 'Incline Dumbbell Press', targetSets: '3x10-12', targetWeight: '20 kg' },
      { id: 'lr-def', name: 'Lateral Raise', targetSets: '4x15', targetWeight: '10 kg' },
      { id: 'tp-def', name: 'Triceps Pushdown', targetSets: '3x12-15', targetWeight: '25 kg' }
    ]
  },
  {
    id: 'ppl-pull-default',
    name: 'Gün 2: Çekiş (Sırt & Biceps)',
    exercises: [
      { id: 'lp-def', name: 'Lat Pulldown', targetSets: '3x10-12', targetWeight: '50 kg' },
      { id: 'br-def', name: 'Barbell Row', targetSets: '3x8-10', targetWeight: '50 kg' },
      { id: 'sr-def', name: 'Seated Cable Row', targetSets: '3x10-12', targetWeight: '45 kg' },
      { id: 'fp-def', name: 'Face Pull', targetSets: '3x15', targetWeight: '15 kg' },
      { id: 'bc-def', name: 'Barbell Curl', targetSets: '3x10-12', targetWeight: '25 kg' },
      { id: 'hc-def', name: 'Hammer Curl', targetSets: '3x12', targetWeight: '12.5 kg' }
    ]
  },
  {
    id: 'ppl-legs-default',
    name: 'Gün 3: Bacak (Alt Vücut)',
    exercises: [
      { id: 'sq-def', name: 'Squat', targetSets: '3x6-8', targetWeight: '70 kg' },
      { id: 'rdl-def', name: 'Romanian Deadlift', targetSets: '3x8-10', targetWeight: '60 kg' },
      { id: 'lgp-def', name: 'Leg Press', targetSets: '3x10-12', targetWeight: '120 kg' },
      { id: 'lec-def', name: 'Leg Curl', targetSets: '3x12-15', targetWeight: '40 kg' },
      { id: 'cr-def', name: 'Calf Raise', targetSets: '4x15-20', targetWeight: '50 kg' }
    ]
  },
  {
    id: 'rest-default',
    name: 'Dinlenme Günü',
    exercises: [],
    isRestDay: true
  }
];

export interface PresetProgram {
  id: string;
  name: string;
  description: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  daysCount: number;
  program: WorkoutDay[];
}

export const PRESET_PROGRAMS: PresetProgram[] = [
  {
    id: 'guray-2026-hypertrophy',
    name: 'Güray 2026 Hipertrofi Max',
    description: 'Yüksek yoğunluklu, RIR ve Failure tekniklerine dayalı, haftada 5 gün süren detaylı hipertrofi programı.',
    level: 'İleri',
    daysCount: 7,
    program: [
      {
        id: 'gm-1',
        name: 'Pazartesi: Göğüs & Omuz & Triceps',
        exercises: [
          { id: 'gm-pcp', name: 'Plate Loaded Chest Press', targetSets: '2x5-6', targetWeight: '-' },
          { id: 'gm-smi', name: 'Smith Machine Low Incline', targetSets: '2x5-6', targetWeight: '-' },
          { id: 'gm-cfm', name: 'Chest Fly Machine', targetSets: '1x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-spm', name: 'Shoulder Press Machine', targetSets: '2x5-6', targetWeight: '-' },
          { id: 'gm-lr', name: 'Lateral Raise', targetSets: '3x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-tp', name: 'Triceps Pushdown', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-ore', name: 'Overhead Rope Extension', targetSets: '2x8-10 (Fail)', targetWeight: '-' }
        ]
      },
      {
        id: 'gm-2',
        name: 'Salı: Sırt & Biceps',
        exercises: [
          { id: 'gm-lp', name: 'Lat Pulldown', targetSets: '2x6-8', targetWeight: '-' },
          { id: 'gm-wgr', name: 'Plate Loaded Wide Grip Row', targetSets: '3x6-8', targetWeight: '-' },
          { id: 'gm-cr', name: 'Cable Row', targetSets: '1x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-dbc', name: 'Dumbbell Curl', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-cc', name: 'Cable Curl', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-ss1', name: 'SS: Hammer Curl & Rev. BB Curl', targetSets: '2x8-10 (Fail)', targetWeight: '-' }
        ]
      },
      {
        id: 'gm-3',
        name: 'Çarşamba: Bacak & Karın',
        exercises: [
          { id: 'gm-lgp', name: 'Leg Press', targetSets: '2x6-8', targetWeight: '-' },
          { id: 'gm-sms', name: 'Smith Machine Squat', targetSets: '2x6-8', targetWeight: '-' },
          { id: 'gm-le', name: 'Leg Extension', targetSets: '2x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-slc', name: 'Seated Leg Curl', targetSets: '3x8-10', targetWeight: '-' },
          { id: 'gm-cab', name: 'Cable Crunch', targetSets: '3x10', targetWeight: '-' },
          { id: 'gm-scr', name: 'Standing Calf Raise', targetSets: '3x10', targetWeight: '-' }
        ]
      },
      { id: 'rest-gm-1', name: 'Perşembe: Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'gm-5',
        name: 'Cuma: Omuz & Göğüs & Triceps',
        exercises: [
          { id: 'gm-spm2', name: 'Shoulder Press Machine', targetSets: '2x5-6', targetWeight: '-' },
          { id: 'gm-lr2', name: 'Lateral Raise', targetSets: '3x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-smi2', name: 'Smith Machine Low Incline', targetSets: '2x5-6', targetWeight: '-' },
          { id: 'gm-cfm2', name: 'Chest Fly Machine', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-rdf', name: 'Cable Rear Delt Fly', targetSets: '2x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-tp2', name: 'Triceps Pushdown', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-ore2', name: 'Overhead Rope Extension', targetSets: '2x8-10 (Fail)', targetWeight: '-' }
        ]
      },
      {
        id: 'gm-6',
        name: 'Cumartesi: Sırt & Kol & Bacak (Karma)',
        exercises: [
          { id: 'gm-wgr2', name: 'Plate Loaded Wide Grip Row', targetSets: '3x6-8', targetWeight: '-' },
          { id: 'gm-cglp', name: 'Close Grip Lat Pulldown', targetSets: '3x6-8', targetWeight: '-' },
          { id: 'gm-cc2', name: 'Cable Curl', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-ss2', name: 'SS: Hammer Curl & Rev. BB Curl', targetSets: '2x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-lgp2', name: 'Leg Press', targetSets: '2x6-8', targetWeight: '-' },
          { id: 'gm-le2', name: 'Leg Extension', targetSets: '2x6-8 (Fail)', targetWeight: '-' },
          { id: 'gm-slc2', name: 'Seated Leg Curl', targetSets: '1x8-10 (Fail)', targetWeight: '-' },
          { id: 'gm-cab2', name: 'Cable Crunch', targetSets: '3x10', targetWeight: '-' },
          { id: 'gm-scr2', name: 'Standing Calf Raise', targetSets: '3x10', targetWeight: '-' }
        ]
      },
      { id: 'rest-gm-2', name: 'Pazar: Dinlenme', exercises: [], isRestDay: true }
    ]
  },
  {
    id: 'guray-hypertrophy',
    name: 'Güray Hipertrofi (Pro v1)',
    description: 'Maksimum kas kütlesi ve estetik için yüksek hacimli özel program.',
    level: 'İleri',
    daysCount: 6,
    program: [
      {
        id: 'gh-1',
        name: 'Gün 1: Göğüs & Yan Omuz',
        exercises: [
          { id: 'gh-bp', name: 'Incline Bench Press', targetSets: '4x8-10', targetWeight: '60 kg' },
          { id: 'gh-db', name: 'Flat Dumbbell Press', targetSets: '3x10-12', targetWeight: '30 kg' },
          { id: 'gh-fly', name: 'Cable Fly', targetSets: '3x12-15', targetWeight: '20 kg' },
          { id: 'gh-lr', name: 'Lateral Raise', targetSets: '4x15-20', targetWeight: '12.5 kg' },
          { id: 'gh-up', name: 'Upright Row', targetSets: '3x12', targetWeight: '30 kg' }
        ]
      },
      {
        id: 'gh-2',
        name: 'Gün 2: Sırt & Arka Omuz',
        exercises: [
          { id: 'gh-pu', name: 'Weighted Pull Ups', targetSets: '3x8', targetWeight: '10 kg' },
          { id: 'gh-br', name: 'Barbell Row', targetSets: '4x8-10', targetWeight: '70 kg' },
          { id: 'gh-lp', name: 'Lat Pulldown', targetSets: '3x10-12', targetWeight: '60 kg' },
          { id: 'gh-sr', name: 'Cable Row', targetSets: '3x12', targetWeight: '60 kg' },
          { id: 'gh-fp', name: 'Face Pull', targetSets: '4x15', targetWeight: '20 kg' }
        ]
      },
      {
        id: 'gh-3',
        name: 'Gün 3: Bacak (Quad Odaklı)',
        exercises: [
          { id: 'gh-sq', name: 'Squat', targetSets: '4x6-8', targetWeight: '100 kg' },
          { id: 'gh-lg', name: 'Leg Press', targetSets: '3x10-12', targetWeight: '150 kg' },
          { id: 'gh-le', name: 'Leg Extension', targetSets: '3x12-15', targetWeight: '50 kg' },
          { id: 'gh-wlk', name: 'Walking Lunge', targetSets: '3x20', targetWeight: '20 kg' },
          { id: 'gh-cr', name: 'Calf Raise', targetSets: '4x15', targetWeight: '60 kg' }
        ]
      },
      { id: 'rest-gh-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'gh-4',
        name: 'Gün 4: Omuz & Kollar (Ekstremite)',
        exercises: [
          { id: 'gh-ohp', name: 'Overhead Press', targetSets: '4x8', targetWeight: '50 kg' },
          { id: 'gh-lr2', name: 'Cable Lateral Raise', targetSets: '4x15', targetWeight: '10 kg' },
          { id: 'gh-bc', name: 'Barbell Curl', targetSets: '3x10', targetWeight: '30 kg' },
          { id: 'gh-sc', name: 'Skull Crusher', targetSets: '3x10', targetWeight: '30 kg' },
          { id: 'gh-sup', name: 'Superset: Hammer Curl & Pushdown', targetSets: '3x12', targetWeight: '15 kg' }
        ]
      },
      {
        id: 'gh-5',
        name: 'Gün 5: Arka Bacak & Genel Tekrar',
        exercises: [
          { id: 'gh-dl', name: 'Romanian Deadlift', targetSets: '4x8-10', targetWeight: '80 kg' },
          { id: 'gh-lc', name: 'Leg Curl', targetSets: '3x12', targetWeight: '40 kg' },
          { id: 'gh-hyp', name: 'Hyperextension', targetSets: '3x15', targetWeight: '10 kg' },
          { id: 'gh-abs', name: 'Hanging Leg Raise', targetSets: '4x15', targetWeight: '-' }
        ]
      },
      { id: 'rest-gh-2', name: 'Dinlenme', exercises: [], isRestDay: true }
    ]
  },
  {
    id: 'torso-limbs-split',
    name: 'Gövde & Ekstremite (Torso/Limbs)',
    description: 'Büyük kas grupları (Gövde) ve Kollar/Omuzlar (Ekstremite) olarak ayrılmış modern split.',
    level: 'İleri',
    daysCount: 4,
    program: [
      {
        id: 'tl-1',
        name: 'Gövde (Göğüs & Sırt)',
        exercises: [
          { id: 'tl-bp', name: 'Bench Press', targetSets: '3x6-8', targetWeight: '70 kg' },
          { id: 'tl-br', name: 'Barbell Row', targetSets: '3x6-8', targetWeight: '70 kg' },
          { id: 'tl-idp', name: 'Incline Press', targetSets: '3x10', targetWeight: '25 kg' },
          { id: 'tl-pd', name: 'Lat Pulldown', targetSets: '3x10', targetWeight: '60 kg' },
          { id: 'tl-fly', name: 'Pec Fly', targetSets: '2x15', targetWeight: '15 kg' }
        ]
      },
      {
        id: 'tl-2',
        name: 'Ekstremite (Omuz & Kol)',
        exercises: [
          { id: 'tl-ohp', name: 'Overhead Press', targetSets: '3x8-10', targetWeight: '40 kg' },
          { id: 'tl-lr', name: 'Lateral Raise', targetSets: '4x15', targetWeight: '12.5 kg' },
          { id: 'tl-bc', name: 'Barbell Curl', targetSets: '3x10-12', targetWeight: '30 kg' },
          { id: 'tl-tc', name: 'Triceps Extension', targetSets: '3x10-12', targetWeight: '30 kg' },
          { id: 'tl-hc', name: 'Hammer Curl', targetSets: '3x12', targetWeight: '15 kg' }
        ]
      },
      { id: 'rest-tl-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'tl-3',
        name: 'Bacak (Tüm Alt Vücut)',
        exercises: [
          { id: 'tl-sq', name: 'Squat', targetSets: '3x6-8', targetWeight: '90 kg' },
          { id: 'tl-rdl', name: 'RDL', targetSets: '3x8-10', targetWeight: '80 kg' },
          { id: 'tl-lg', name: 'Leg Press', targetSets: '3x12', targetWeight: '150 kg' },
          { id: 'tl-cf', name: 'Calf Raise', targetSets: '4x15', targetWeight: '60 kg' }
        ]
      }
    ]
  },
  {
    id: 'upper-lower-4',
    name: 'Üst / Alt Vücut (4 Gün)',
    description: 'Klasikleşmiş, dengeli ve toparlanmaya uygun 4 günlük split.',
    level: 'Orta',
    daysCount: 4,
    program: [
      {
        id: 'ul-u1',
        name: 'Üst Vücut (Güç Odaklı)',
        exercises: [
          { id: 'ul-bp', name: 'Bench Press', targetSets: '3x6', targetWeight: '65 kg' },
          { id: 'ul-br', name: 'Pendlay Row', targetSets: '3x6', targetWeight: '65 kg' },
          { id: 'ul-ohp', name: 'Overhead Press', targetSets: '3x8', targetWeight: '40 kg' },
          { id: 'ul-pd', name: 'Pull Ups', targetSets: '3xMax', targetWeight: '-' },
          { id: 'ul-skull', name: 'Skull Crusher', targetSets: '3x10', targetWeight: '25 kg' }
        ]
      },
      {
        id: 'ul-l1',
        name: 'Alt Vücut (Squat Odaklı)',
        exercises: [
          { id: 'ul-sq', name: 'Squat', targetSets: '3x6', targetWeight: '80 kg' },
          { id: 'ul-rdl', name: 'Romanian Deadlift', targetSets: '3x8', targetWeight: '70 kg' },
          { id: 'ul-lg', name: 'Leg Press', targetSets: '3x10', targetWeight: '140 kg' },
          { id: 'ul-lc', name: 'Leg Curl', targetSets: '3x12', targetWeight: '40 kg' },
          { id: 'ul-cr', name: 'Calf Raise', targetSets: '4x15', targetWeight: '60 kg' }
        ]
      },
      { id: 'rest-ul-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'ul-u2',
        name: 'Üst Vücut (Hipertrofi)',
        exercises: [
          { id: 'ul-idp', name: 'Incline DB Press', targetSets: '3x10', targetWeight: '25 kg' },
          { id: 'ul-lp', name: 'Lat Pulldown', targetSets: '3x10', targetWeight: '60 kg' },
          { id: 'ul-lr', name: 'Lateral Raise', targetSets: '3x15', targetWeight: '10 kg' },
          { id: 'ul-cr', name: 'Cable Row', targetSets: '3x12', targetWeight: '50 kg' },
          { id: 'ul-bc', name: 'Biceps Curl', targetSets: '3x12', targetWeight: '12.5 kg' }
        ]
      },
      {
        id: 'ul-l2',
        name: 'Alt Vücut (Deadlift Odaklı)',
        exercises: [
          { id: 'ul-dl', name: 'Deadlift', targetSets: '3x5', targetWeight: '90 kg' },
          { id: 'ul-fs', name: 'Goblet Squat', targetSets: '3x10', targetWeight: '24 kg' },
          { id: 'ul-lung', name: 'Lunges', targetSets: '3x12', targetWeight: '15 kg' },
          { id: 'ul-ext', name: 'Leg Extension', targetSets: '3x15', targetWeight: '50 kg' }
        ]
      }
    ]
  },
  {
    id: 'full-body-3-day',
    name: 'Full Body (3 Gün)',
    description: 'Pazartesi, Çarşamba, Cuma antrenman; diğer günler dinlenme şeklinde 7 günlük döngü.',
    level: 'Başlangıç',
    daysCount: 7,
    program: [
      {
        id: 'fb-1',
        name: 'Gün 1 (Temel)',
        exercises: [
          { id: 'sq-1', name: 'Barbell Squat', targetSets: '3x8-10', targetWeight: '60 kg' },
          { id: 'bp-1', name: 'Bench Press', targetSets: '3x8-10', targetWeight: '50 kg' },
          { id: 'sr-1', name: 'Seated Row', targetSets: '3x10-12', targetWeight: '45 kg' },
          { id: 'lr-1', name: 'Lateral Raise', targetSets: '3x15', targetWeight: '7.5 kg' },
          { id: 'pd-1', name: 'Triceps Pushdown', targetSets: '3x12-15', targetWeight: '20 kg' }
        ]
      },
      { id: 'rest-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'fb-2',
        name: 'Gün 2 (Güç)',
        exercises: [
          { id: 'dl-1', name: 'Deadlift', targetSets: '3x5', targetWeight: '80 kg' },
          { id: 'ohp-1', name: 'Overhead Press', targetSets: '3x8-10', targetWeight: '30 kg' },
          { id: 'pu-1', name: 'Pull Ups / Lat Pulldown', targetSets: '3xMax', targetWeight: '-' },
          { id: 'idp-1', name: 'Incline DB Press', targetSets: '3x10-12', targetWeight: '17.5 kg' },
          { id: 'bc-1', name: 'Barbell Curl', targetSets: '3x12', targetWeight: '20 kg' }
        ]
      },
      { id: 'rest-2', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'fb-3',
        name: 'Gün 3 (Hacim & Detay)',
        exercises: [
          { id: 'lp-1', name: 'Leg Press', targetSets: '3x10-12', targetWeight: '100 kg' },
          { id: 'db-1', name: 'Dumbbell Bench Press', targetSets: '3x10-12', targetWeight: '22.5 kg' },
          { id: 'br-1', name: 'Barbell Row', targetSets: '3x8-10', targetWeight: '40 kg' },
          { id: 'fp-1', name: 'Facepull', targetSets: '3x15', targetWeight: '15 kg' },
          { id: 'abs-1', name: 'Plank', targetSets: '3x60sn', targetWeight: '-' }
        ]
      },
      { id: 'rest-3', name: 'Dinlenme', exercises: [], isRestDay: true },
      { id: 'rest-4', name: 'Dinlenme', exercises: [], isRestDay: true }
    ]
  },
  {
    id: 'stronglifts-5x5',
    name: 'StrongLifts 5x5 (Kuvvet)',
    description: 'Sadece temel hareketlerle maksimum güç kazanımı. 1 Gün Dolu 1 Gün Boş.',
    level: 'Başlangıç',
    daysCount: 4,
    program: [
      {
        id: 'sl-a',
        name: 'A (Squat/Bench/Row)',
        exercises: [
          { id: 'sq-sl', name: 'Barbell Squat', targetSets: '5x5', targetWeight: '40 kg' },
          { id: 'bp-sl', name: 'Bench Press', targetSets: '5x5', targetWeight: '40 kg' },
          { id: 'br-sl', name: 'Barbell Row', targetSets: '5x5', targetWeight: '30 kg' }
        ]
      },
      { id: 'rest-sl-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'sl-b',
        name: 'B (Squat/OHP/Deadlift)',
        exercises: [
          { id: 'sq-slb', name: 'Barbell Squat', targetSets: '5x5', targetWeight: '42.5 kg' },
          { id: 'ohp-sl', name: 'Overhead Press', targetSets: '5x5', targetWeight: '20 kg' },
          { id: 'dl-sl', name: 'Deadlift', targetSets: '1x5', targetWeight: '60 kg' }
        ]
      },
      { id: 'rest-sl-2', name: 'Dinlenme', exercises: [], isRestDay: true }
    ]
  },
  {
    id: 'ppl-split-3',
    name: 'Push / Pull / Legs (Döngü)',
    description: '3 gün antrenman, 1 gün dinlenme döngüsü. Sürekli tekrar eder.',
    level: 'Orta',
    daysCount: 4,
    program: [
      {
        id: 'p-1',
        name: 'İtiş (Göğüs/Omuz/Triceps)',
        exercises: [
          { id: 'bp-p', name: 'Bench Press', targetSets: '3x6-8', targetWeight: '60 kg' },
          { id: 'ohp-p', name: 'Overhead Press', targetSets: '3x8-10', targetWeight: '35 kg' },
          { id: 'idp-p', name: 'Incline DB Press', targetSets: '3x10-12', targetWeight: '20 kg' },
          { id: 'lr-p', name: 'Lateral Raise', targetSets: '3x15', targetWeight: '10 kg' },
          { id: 'pd-p', name: 'Triceps Pushdown', targetSets: '3x12-15', targetWeight: '25 kg' }
        ]
      },
      {
        id: 'p-2',
        name: 'Çekiş (Sırt/Biceps)',
        exercises: [
          { id: 'br-p', name: 'Barbell Row', targetSets: '3x6-8', targetWeight: '60 kg' },
          { id: 'pu-p', name: 'Lat Pulldown', targetSets: '3x10-12', targetWeight: '50 kg' },
          { id: 'sr-p', name: 'Seated Row', targetSets: '3x10-12', targetWeight: '45 kg' },
          { id: 'bc-p', name: 'Barbell Curl', targetSets: '3x12', targetWeight: '20 kg' },
          { id: 'hc-p', name: 'Hammer Curl', targetSets: '3x12', targetWeight: '12.5 kg' }
        ]
      },
      {
        id: 'p-3',
        name: 'Bacak (Alt Vücut)',
        exercises: [
          { id: 'sq-l', name: 'Squat', targetSets: '3x6-8', targetWeight: '70 kg' },
          { id: 'lp-l', name: 'Leg Press', targetSets: '3x12', targetWeight: '120 kg' },
          { id: 'rdl-l', name: 'Romanian Deadlift', targetSets: '3x10-12', targetWeight: '60 kg' },
          { id: 'lc-l', name: 'Leg Curl', targetSets: '3x12-15', targetWeight: '40 kg' },
          { id: 'calf-l', name: 'Calf Raise', targetSets: '4x15', targetWeight: '60 kg' }
        ]
      },
      { id: 'rest-ppl', name: 'Dinlenme', exercises: [], isRestDay: true }
    ]
  },
  {
    id: 'scientific-split-4-day',
    name: 'Pro Bölgesel Split (4 Gün)',
    description: '4 gün antrenman, 1 gün dinlenme döngüsü.',
    level: 'Orta',
    daysCount: 5,
    program: [
      {
        id: 'split-1',
        name: 'Göğüs & Arka Kol',
        exercises: [
          { id: 'bp-s', name: 'Flat Bench Press', targetSets: '3x8-10', targetWeight: '60 kg' },
          { id: 'idp-s', name: 'Incline DB Press', targetSets: '3x10-12', targetWeight: '22.5 kg' },
          { id: 'pf-s', name: 'Pec Fly', targetSets: '3x12-15', targetWeight: '45 kg' },
          { id: 'sc-s', name: 'Skull Crusher', targetSets: '3x10-12', targetWeight: '25 kg' },
          { id: 'pd-s', name: 'Cable Pushdown', targetSets: '3x12-15', targetWeight: '20 kg' }
        ]
      },
      {
        id: 'split-2',
        name: 'Sırt & Ön Kol',
        exercises: [
          { id: 'pu-s', name: 'Pull Ups / Lat Pulldown', targetSets: '3xMax', targetWeight: '-' },
          { id: 'br-s', name: 'Barbell Row', targetSets: '3x8-10', targetWeight: '60 kg' },
          { id: 'sr-s', name: 'Seated Row', targetSets: '3x10-12', targetWeight: '50 kg' },
          { id: 'bc-s', name: 'Barbell Curl', targetSets: '3x10-12', targetWeight: '25 kg' },
          { id: 'hc-s', name: 'Hammer Curl', targetSets: '3x12', targetWeight: '12.5 kg' }
        ]
      },
      { id: 'rest-split-1', name: 'Dinlenme', exercises: [], isRestDay: true },
      {
        id: 'split-3',
        name: 'Omuz & Karın',
        exercises: [
          { id: 'ohp-s', name: 'Overhead Press', targetSets: '3x8-10', targetWeight: '35 kg' },
          { id: 'lr-s', name: 'Lateral Raise', targetSets: '4x15', targetWeight: '10 kg' },
          { id: 'rd-s', name: 'Facepull', targetSets: '3x15', targetWeight: '15 kg' },
          { id: 'alr-s', name: 'Hanging Leg Raise', targetSets: '3x15', targetWeight: '-' },
          { id: 'ap-s', name: 'Plank', targetSets: '3x60sn', targetWeight: '-' }
        ]
      },
      {
        id: 'split-4',
        name: 'Bacak',
        exercises: [
          { id: 'sq-s', name: 'Barbell Squat', targetSets: '3x6-8', targetWeight: '70 kg' },
          { id: 'lp-s', name: 'Leg Press', targetSets: '3x10-12', targetWeight: '120 kg' },
          { id: 'le-s', name: 'Leg Extension', targetSets: '3x12-15', targetWeight: '40 kg' },
          { id: 'rdl-s', name: 'Romanian Deadlift', targetSets: '3x10-12', targetWeight: '60 kg' },
          { id: 'cr-s', name: 'Calf Raise', targetSets: '4x15', targetWeight: '60 kg' }
        ]
      }
    ]
  },
  {
    id: 'arnold-split-classic',
    name: 'Arnold Split (3 Gün)',
    description: 'Klasik Arnold split. 3 gün dolu, 1 gün boş döngüsü.',
    level: 'İleri',
    daysCount: 4,
    program: [
      {
        id: 'arn-1',
        name: 'Göğüs & Sırt',
        exercises: [
          { id: 'bp-a', name: 'Bench Press', targetSets: '4x10', targetWeight: '60 kg' },
          { id: 'idp-a', name: 'Incline DB Press', targetSets: '4x10', targetWeight: '22.5 kg' },
          { id: 'pu-a', name: 'Lat Pulldown', targetSets: '4x10', targetWeight: '55 kg' },
          { id: 'br-a', name: 'Barbell Row', targetSets: '4x10', targetWeight: '60 kg' },
          { id: 'dp-a', name: 'Dips', targetSets: '3x10-12', targetWeight: '-' }
        ]
      },
      {
        id: 'arn-2',
        name: 'Omuz & Kol',
        exercises: [
          { id: 'sp-a', name: 'DB Shoulder Press', targetSets: '4x10', targetWeight: '20 kg' },
          { id: 'lr-a', name: 'Lateral Raise', targetSets: '3x15', targetWeight: '12.5 kg' },
          { id: 'bc-a', name: 'Barbell Curl', targetSets: '4x10', targetWeight: '30 kg' },
          { id: 'sc-a', name: 'Skull Crusher', targetSets: '4x10', targetWeight: '25 kg' },
          { id: 'hc-a', name: 'Hammer Curl', targetSets: '3x12', targetWeight: '15 kg' }
        ]
      },
      {
        id: 'arn-3',
        name: 'Bacak & Karın',
        exercises: [
          { id: 'sq-a', name: 'Barbell Squat', targetSets: '4x10', targetWeight: '80 kg' },
          { id: 'rdl-a', name: 'Romanian Deadlift', targetSets: '4x10', targetWeight: '60 kg' },
          { id: 'lp-a', name: 'Leg Press', targetSets: '4x12', targetWeight: '140 kg' },
          { id: 'abs-a', name: 'Leg Raise', targetSets: '4x15', targetWeight: '-' }
        ]
      },
      { id: 'rest-arn', name: 'Dinlenme', exercises: [], isRestDay: true }
    ]
  }
];

export const MOTIVATION_QUOTES = [
  "Bugün yapamadığın her şey yarın için birer tecrübedir.",
  "Disiplin, ne istediğin ile neyi en çok istediğin arasındaki seçimdir.",
  "Pes etmek, sadece bitiş çizgisini görememektir.",
  "Acı geçicidir, gurur ise sonsuz.",
  "Vücudun her şeyi yapabilir, sadece zihnini ikna etmen gerekir.",
  "Sınırlarını zorlamadıkça, gerçek kapasiteni asla öğrenemezsin.",
  "Küçük adımlar, büyük hedeflere giden yolu oluşturur.",
  "En zor antrenman, başlamadığın antrenmandır.",
  "Zayıf yönlerinle yüzleş ve onları güce dönüştür.",
  "Başarı, her gün yapılan küçük eylemlerin toplamıdır."
];
