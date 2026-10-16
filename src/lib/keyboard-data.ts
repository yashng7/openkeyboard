import {
  ConnectedDeviceInfo,
  FormFactor,
  KeyCapDefinition,
  KeyboardProfile,
  MacroSlot,
  PerKeyTriggerConfig,
} from '@/types/keyboard';

// Row 0: Function Row (for 75%, TKL, 100%)
const ROW_FN: KeyCapDefinition[] = [
  { id: 'Escape', row: 0, col: 0, defaultLabel: 'Esc', defaultCode: 'Escape', width: 1, category: 'system' },
  { id: 'F1', row: 0, col: 1, defaultLabel: 'F1', defaultCode: 'F1', width: 1, gapBefore: 0.25, category: 'function' },
  { id: 'F2', row: 0, col: 2, defaultLabel: 'F2', defaultCode: 'F2', width: 1, category: 'function' },
  { id: 'F3', row: 0, col: 3, defaultLabel: 'F3', defaultCode: 'F3', width: 1, category: 'function' },
  { id: 'F4', row: 0, col: 4, defaultLabel: 'F4', defaultCode: 'F4', width: 1, category: 'function' },
  { id: 'F5', row: 0, col: 5, defaultLabel: 'F5', defaultCode: 'F5', width: 1, gapBefore: 0.25, category: 'function' },
  { id: 'F6', row: 0, col: 6, defaultLabel: 'F6', defaultCode: 'F6', width: 1, category: 'function' },
  { id: 'F7', row: 0, col: 7, defaultLabel: 'F7', defaultCode: 'F7', width: 1, category: 'function' },
  { id: 'F8', row: 0, col: 8, defaultLabel: 'F8', defaultCode: 'F8', width: 1, category: 'function' },
  { id: 'F9', row: 0, col: 9, defaultLabel: 'F9', defaultCode: 'F9', width: 1, gapBefore: 0.25, category: 'function' },
  { id: 'F10', row: 0, col: 10, defaultLabel: 'F10', defaultCode: 'F10', width: 1, category: 'function' },
  { id: 'F11', row: 0, col: 11, defaultLabel: 'F11', defaultCode: 'F11', width: 1, category: 'function' },
  { id: 'F12', row: 0, col: 12, defaultLabel: 'F12', defaultCode: 'F12', width: 1, category: 'function' },
];

// Row 1: Number Row
const ROW_NUM: KeyCapDefinition[] = [
  { id: 'Backquote', row: 1, col: 0, defaultLabel: '` ~', defaultCode: 'Backquote', width: 1, category: 'alpha' },
  { id: 'Digit1', row: 1, col: 1, defaultLabel: '1 !', defaultCode: 'Digit1', width: 1, category: 'alpha' },
  { id: 'Digit2', row: 1, col: 2, defaultLabel: '2 @', defaultCode: 'Digit2', width: 1, category: 'alpha' },
  { id: 'Digit3', row: 1, col: 3, defaultLabel: '3 #', defaultCode: 'Digit3', width: 1, category: 'alpha' },
  { id: 'Digit4', row: 1, col: 4, defaultLabel: '4 $', defaultCode: 'Digit4', width: 1, category: 'alpha' },
  { id: 'Digit5', row: 1, col: 5, defaultLabel: '5 %', defaultCode: 'Digit5', width: 1, category: 'alpha' },
  { id: 'Digit6', row: 1, col: 6, defaultLabel: '6 ^', defaultCode: 'Digit6', width: 1, category: 'alpha' },
  { id: 'Digit7', row: 1, col: 7, defaultLabel: '7 &', defaultCode: 'Digit7', width: 1, category: 'alpha' },
  { id: 'Digit8', row: 1, col: 8, defaultLabel: '8 *', defaultCode: 'Digit8', width: 1, category: 'alpha' },
  { id: 'Digit9', row: 1, col: 9, defaultLabel: '9 (', defaultCode: 'Digit9', width: 1, category: 'alpha' },
  { id: 'Digit0', row: 1, col: 10, defaultLabel: '0 )', defaultCode: 'Digit0', width: 1, category: 'alpha' },
  { id: 'Minus', row: 1, col: 11, defaultLabel: '- _', defaultCode: 'Minus', width: 1, category: 'alpha' },
  { id: 'Equal', row: 1, col: 12, defaultLabel: '= +', defaultCode: 'Equal', width: 1, category: 'alpha' },
  { id: 'Backspace', row: 1, col: 13, defaultLabel: 'Backspace', defaultCode: 'Backspace', width: 2, category: 'modifier' },
];

// Row 2: Top Alpha (QWERTY)
const ROW_QWERTY: KeyCapDefinition[] = [
  { id: 'Tab', row: 2, col: 0, defaultLabel: 'Tab', defaultCode: 'Tab', width: 1.5, category: 'modifier' },
  { id: 'KeyQ', row: 2, col: 1, defaultLabel: 'Q', defaultCode: 'KeyQ', width: 1, category: 'alpha' },
  { id: 'KeyW', row: 2, col: 2, defaultLabel: 'W', defaultCode: 'KeyW', width: 1, category: 'alpha' },
  { id: 'KeyE', row: 2, col: 3, defaultLabel: 'E', defaultCode: 'KeyE', width: 1, category: 'alpha' },
  { id: 'KeyR', row: 2, col: 4, defaultLabel: 'R', defaultCode: 'KeyR', width: 1, category: 'alpha' },
  { id: 'KeyT', row: 2, col: 5, defaultLabel: 'T', defaultCode: 'KeyT', width: 1, category: 'alpha' },
  { id: 'KeyY', row: 2, col: 6, defaultLabel: 'Y', defaultCode: 'KeyY', width: 1, category: 'alpha' },
  { id: 'KeyU', row: 2, col: 7, defaultLabel: 'U', defaultCode: 'KeyU', width: 1, category: 'alpha' },
  { id: 'KeyI', row: 2, col: 8, defaultLabel: 'I', defaultCode: 'KeyI', width: 1, category: 'alpha' },
  { id: 'KeyO', row: 2, col: 9, defaultLabel: 'O', defaultCode: 'KeyO', width: 1, category: 'alpha' },
  { id: 'KeyP', row: 2, col: 10, defaultLabel: 'P', defaultCode: 'KeyP', width: 1, category: 'alpha' },
  { id: 'BracketLeft', row: 2, col: 11, defaultLabel: '[ {', defaultCode: 'BracketLeft', width: 1, category: 'alpha' },
  { id: 'BracketRight', row: 2, col: 12, defaultLabel: '] }', defaultCode: 'BracketRight', width: 1, category: 'alpha' },
  { id: 'Backslash', row: 2, col: 13, defaultLabel: '\\ |', defaultCode: 'Backslash', width: 1.5, category: 'alpha' },
];

// Row 3: Home Row (ASDF)
const ROW_ASDF: KeyCapDefinition[] = [
  { id: 'CapsLock', row: 3, col: 0, defaultLabel: 'Caps', defaultCode: 'CapsLock', width: 1.75, category: 'modifier' },
  { id: 'KeyA', row: 3, col: 1, defaultLabel: 'A', defaultCode: 'KeyA', width: 1, category: 'alpha' },
  { id: 'KeyS', row: 3, col: 2, defaultLabel: 'S', defaultCode: 'KeyS', width: 1, category: 'alpha' },
  { id: 'KeyD', row: 3, col: 3, defaultLabel: 'D', defaultCode: 'KeyD', width: 1, category: 'alpha' },
  { id: 'KeyF', row: 3, col: 4, defaultLabel: 'F', defaultCode: 'KeyF', width: 1, category: 'alpha' },
  { id: 'KeyG', row: 3, col: 5, defaultLabel: 'G', defaultCode: 'KeyG', width: 1, category: 'alpha' },
  { id: 'KeyH', row: 3, col: 6, defaultLabel: 'H', defaultCode: 'KeyH', width: 1, category: 'alpha' },
  { id: 'KeyJ', row: 3, col: 7, defaultLabel: 'J', defaultCode: 'KeyJ', width: 1, category: 'alpha' },
  { id: 'KeyK', row: 3, col: 8, defaultLabel: 'K', defaultCode: 'KeyK', width: 1, category: 'alpha' },
  { id: 'KeyL', row: 3, col: 9, defaultLabel: 'L', defaultCode: 'KeyL', width: 1, category: 'alpha' },
  { id: 'Semicolon', row: 3, col: 10, defaultLabel: '; :', defaultCode: 'Semicolon', width: 1, category: 'alpha' },
  { id: 'Quote', row: 3, col: 11, defaultLabel: "' \"", defaultCode: 'Quote', width: 1, category: 'alpha' },
  { id: 'Enter', row: 3, col: 12, defaultLabel: 'Enter', defaultCode: 'Enter', width: 2.25, category: 'modifier' },
];

// Row 4: Bottom Alpha (ZXCV)
const ROW_ZXCV: KeyCapDefinition[] = [
  { id: 'ShiftLeft', row: 4, col: 0, defaultLabel: 'LShift', defaultCode: 'ShiftLeft', width: 2.25, category: 'modifier' },
  { id: 'KeyZ', row: 4, col: 1, defaultLabel: 'Z', defaultCode: 'KeyZ', width: 1, category: 'alpha' },
  { id: 'KeyX', row: 4, col: 2, defaultLabel: 'X', defaultCode: 'KeyX', width: 1, category: 'alpha' },
  { id: 'KeyC', row: 4, col: 3, defaultLabel: 'C', defaultCode: 'KeyC', width: 1, category: 'alpha' },
  { id: 'KeyV', row: 4, col: 4, defaultLabel: 'V', defaultCode: 'KeyV', width: 1, category: 'alpha' },
  { id: 'KeyB', row: 4, col: 5, defaultLabel: 'B', defaultCode: 'KeyB', width: 1, category: 'alpha' },
  { id: 'KeyN', row: 4, col: 6, defaultLabel: 'N', defaultCode: 'KeyN', width: 1, category: 'alpha' },
  { id: 'KeyM', row: 4, col: 7, defaultLabel: 'M', defaultCode: 'KeyM', width: 1, category: 'alpha' },
  { id: 'Comma', row: 4, col: 8, defaultLabel: ', <', defaultCode: 'Comma', width: 1, category: 'alpha' },
  { id: 'Period', row: 4, col: 9, defaultLabel: '. >', defaultCode: 'Period', width: 1, category: 'alpha' },
  { id: 'Slash', row: 4, col: 10, defaultLabel: '/ ?', defaultCode: 'Slash', width: 1, category: 'alpha' },
];

export function getLayoutRows(formFactor: FormFactor): KeyCapDefinition[][] {
  if (formFactor === '60%') {
    const row1 = [
      { id: 'Escape', row: 1, col: 0, defaultLabel: 'Esc', defaultCode: 'Escape', width: 1, category: 'system' as const },
      ...ROW_NUM.slice(1),
    ];
    const row4 = [
      ...ROW_ZXCV,
      { id: 'ShiftRight', row: 4, col: 11, defaultLabel: 'RShift', defaultCode: 'ShiftRight', width: 2.75, category: 'modifier' as const },
    ];
    const row5: KeyCapDefinition[] = [
      { id: 'ControlLeft', row: 5, col: 0, defaultLabel: 'LCtrl', defaultCode: 'ControlLeft', width: 1.25, category: 'modifier' },
      { id: 'MetaLeft', row: 5, col: 1, defaultLabel: 'Win', defaultCode: 'MetaLeft', width: 1.25, category: 'modifier' },
      { id: 'AltLeft', row: 5, col: 2, defaultLabel: 'LAlt', defaultCode: 'AltLeft', width: 1.25, category: 'modifier' },
      { id: 'Space', row: 5, col: 3, defaultLabel: 'Space', defaultCode: 'Space', width: 6.25, category: 'alpha' },
      { id: 'AltRight', row: 5, col: 4, defaultLabel: 'RAlt', defaultCode: 'AltRight', width: 1.25, category: 'modifier' },
      { id: 'Fn1', row: 5, col: 5, defaultLabel: 'Fn', defaultCode: 'Fn1', width: 1.25, category: 'system' },
      { id: 'ContextMenu', row: 5, col: 6, defaultLabel: 'Menu', defaultCode: 'ContextMenu', width: 1.25, category: 'modifier' },
      { id: 'ControlRight', row: 5, col: 7, defaultLabel: 'RCtrl', defaultCode: 'ControlRight', width: 1.25, category: 'modifier' },
    ];
    return [row1, ROW_QWERTY, ROW_ASDF, row4, row5];
  }

  if (formFactor === '65%') {
    const row1 = [
      { id: 'Escape', row: 1, col: 0, defaultLabel: 'Esc', defaultCode: 'Escape', width: 1, category: 'system' as const },
      ...ROW_NUM.slice(1),
      { id: 'Delete', row: 1, col: 14, defaultLabel: 'Del', defaultCode: 'Delete', width: 1, category: 'navigation' as const },
    ];
    const row2 = [
      ...ROW_QWERTY,
      { id: 'PageUp', row: 2, col: 14, defaultLabel: 'PgUp', defaultCode: 'PageUp', width: 1, category: 'navigation' as const },
    ];
    const row3 = [
      ...ROW_ASDF,
      { id: 'PageDown', row: 3, col: 13, defaultLabel: 'PgDn', defaultCode: 'PageDown', width: 1, category: 'navigation' as const },
    ];
    const row4 = [
      ...ROW_ZXCV,
      { id: 'ShiftRight', row: 4, col: 11, defaultLabel: 'RShift', defaultCode: 'ShiftRight', width: 1.75, category: 'modifier' as const },
      { id: 'ArrowUp', row: 4, col: 12, defaultLabel: '↑', defaultCode: 'ArrowUp', width: 1, category: 'navigation' as const },
      { id: 'End', row: 4, col: 13, defaultLabel: 'End', defaultCode: 'End', width: 1, category: 'navigation' as const },
    ];
    const row5: KeyCapDefinition[] = [
      { id: 'ControlLeft', row: 5, col: 0, defaultLabel: 'LCtrl', defaultCode: 'ControlLeft', width: 1.25, category: 'modifier' },
      { id: 'MetaLeft', row: 5, col: 1, defaultLabel: 'Win', defaultCode: 'MetaLeft', width: 1.25, category: 'modifier' },
      { id: 'AltLeft', row: 5, col: 2, defaultLabel: 'LAlt', defaultCode: 'AltLeft', width: 1.25, category: 'modifier' },
      { id: 'Space', row: 5, col: 3, defaultLabel: 'Space', defaultCode: 'Space', width: 6.25, category: 'alpha' },
      { id: 'AltRight', row: 5, col: 4, defaultLabel: 'RAlt', defaultCode: 'AltRight', width: 1, category: 'modifier' },
      { id: 'Fn1', row: 5, col: 5, defaultLabel: 'Fn', defaultCode: 'Fn1', width: 1, category: 'system' },
      { id: 'ControlRight', row: 5, col: 6, defaultLabel: 'RCtrl', defaultCode: 'ControlRight', width: 1, category: 'modifier' },
      { id: 'ArrowLeft', row: 5, col: 7, defaultLabel: '←', defaultCode: 'ArrowLeft', width: 1, category: 'navigation' },
      { id: 'ArrowDown', row: 5, col: 8, defaultLabel: '↓', defaultCode: 'ArrowDown', width: 1, category: 'navigation' },
      { id: 'ArrowRight', row: 5, col: 9, defaultLabel: '→', defaultCode: 'ArrowRight', width: 1, category: 'navigation' },
    ];
    return [row1, row2, row3, row4, row5];
  }

  if (formFactor === '75%') {
    const row0 = [
      ...ROW_FN.map((k) => ({ ...k, gapBefore: undefined })),
      { id: 'PrintScreen', row: 0, col: 13, defaultLabel: 'PrtSc', defaultCode: 'PrintScreen', width: 1, category: 'system' as const },
      { id: 'AudioVolumeMute', row: 0, col: 14, defaultLabel: 'Knob', defaultCode: 'AudioVolumeMute', width: 1, category: 'system' as const },
    ];
    const row1 = [
      ...ROW_NUM,
      { id: 'Delete', row: 1, col: 14, defaultLabel: 'Del', defaultCode: 'Delete', width: 1, category: 'navigation' as const },
    ];
    const row2 = [
      ...ROW_QWERTY,
      { id: 'PageUp', row: 2, col: 14, defaultLabel: 'PgUp', defaultCode: 'PageUp', width: 1, category: 'navigation' as const },
    ];
    const row3 = [
      ...ROW_ASDF,
      { id: 'PageDown', row: 3, col: 13, defaultLabel: 'PgDn', defaultCode: 'PageDown', width: 1, category: 'navigation' as const },
    ];
    const row4 = [
      ...ROW_ZXCV,
      { id: 'ShiftRight', row: 4, col: 11, defaultLabel: 'RShift', defaultCode: 'ShiftRight', width: 1.75, category: 'modifier' as const },
      { id: 'ArrowUp', row: 4, col: 12, defaultLabel: '↑', defaultCode: 'ArrowUp', width: 1, category: 'navigation' as const },
      { id: 'Home', row: 4, col: 13, defaultLabel: 'Home', defaultCode: 'Home', width: 1, category: 'navigation' as const },
    ];
    const row5: KeyCapDefinition[] = [
      { id: 'ControlLeft', row: 5, col: 0, defaultLabel: 'LCtrl', defaultCode: 'ControlLeft', width: 1.25, category: 'modifier' },
      { id: 'MetaLeft', row: 5, col: 1, defaultLabel: 'Win', defaultCode: 'MetaLeft', width: 1.25, category: 'modifier' },
      { id: 'AltLeft', row: 5, col: 2, defaultLabel: 'LAlt', defaultCode: 'AltLeft', width: 1.25, category: 'modifier' },
      { id: 'Space', row: 5, col: 3, defaultLabel: 'Space', defaultCode: 'Space', width: 6.25, category: 'alpha' },
      { id: 'AltRight', row: 5, col: 4, defaultLabel: 'RAlt', defaultCode: 'AltRight', width: 1, category: 'modifier' },
      { id: 'Fn1', row: 5, col: 5, defaultLabel: 'Fn', defaultCode: 'Fn1', width: 1, category: 'system' },
      { id: 'ControlRight', row: 5, col: 6, defaultLabel: 'RCtrl', defaultCode: 'ControlRight', width: 1, category: 'modifier' },
      { id: 'ArrowLeft', row: 5, col: 7, defaultLabel: '←', defaultCode: 'ArrowLeft', width: 1, category: 'navigation' },
      { id: 'ArrowDown', row: 5, col: 8, defaultLabel: '↓', defaultCode: 'ArrowDown', width: 1, category: 'navigation' },
      { id: 'ArrowRight', row: 5, col: 9, defaultLabel: '→', defaultCode: 'ArrowRight', width: 1, category: 'navigation' },
    ];
    return [row0, row1, row2, row3, row4, row5];
  }

  // TKL (80%) and 100% share the main + nav clusters
  const tklRow0: KeyCapDefinition[] = [
    ...ROW_FN,
    { id: 'PrintScreen', row: 0, col: 13, defaultLabel: 'PrtSc', defaultCode: 'PrintScreen', width: 1, gapBefore: 0.35, category: 'system' },
    { id: 'ScrollLock', row: 0, col: 14, defaultLabel: 'ScrLk', defaultCode: 'ScrollLock', width: 1, category: 'system' },
    { id: 'Pause', row: 0, col: 15, defaultLabel: 'Pause', defaultCode: 'Pause', width: 1, category: 'system' },
  ];
  const tklRow1: KeyCapDefinition[] = [
    ...ROW_NUM,
    { id: 'Insert', row: 1, col: 14, defaultLabel: 'Ins', defaultCode: 'Insert', width: 1, gapBefore: 0.35, category: 'navigation' },
    { id: 'Home', row: 1, col: 15, defaultLabel: 'Home', defaultCode: 'Home', width: 1, category: 'navigation' },
    { id: 'PageUp', row: 1, col: 16, defaultLabel: 'PgUp', defaultCode: 'PageUp', width: 1, category: 'navigation' },
  ];
  const tklRow2: KeyCapDefinition[] = [
    ...ROW_QWERTY,
    { id: 'Delete', row: 2, col: 14, defaultLabel: 'Del', defaultCode: 'Delete', width: 1, gapBefore: 0.35, category: 'navigation' },
    { id: 'End', row: 2, col: 15, defaultLabel: 'End', defaultCode: 'End', width: 1, category: 'navigation' },
    { id: 'PageDown', row: 2, col: 16, defaultLabel: 'PgDn', defaultCode: 'PageDown', width: 1, category: 'navigation' },
  ];
  const tklRow3: KeyCapDefinition[] = [...ROW_ASDF];
  const tklRow4: KeyCapDefinition[] = [
    ...ROW_ZXCV,
    { id: 'ShiftRight', row: 4, col: 11, defaultLabel: 'RShift', defaultCode: 'ShiftRight', width: 2.75, category: 'modifier' },
    { id: 'ArrowUp', row: 4, col: 12, defaultLabel: '↑', defaultCode: 'ArrowUp', width: 1, gapBefore: 1.35, category: 'navigation' },
  ];
  const tklRow5: KeyCapDefinition[] = [
    { id: 'ControlLeft', row: 5, col: 0, defaultLabel: 'LCtrl', defaultCode: 'ControlLeft', width: 1.25, category: 'modifier' },
    { id: 'MetaLeft', row: 5, col: 1, defaultLabel: 'Win', defaultCode: 'MetaLeft', width: 1.25, category: 'modifier' },
    { id: 'AltLeft', row: 5, col: 2, defaultLabel: 'LAlt', defaultCode: 'AltLeft', width: 1.25, category: 'modifier' },
    { id: 'Space', row: 5, col: 3, defaultLabel: 'Space', defaultCode: 'Space', width: 6.25, category: 'alpha' },
    { id: 'AltRight', row: 5, col: 4, defaultLabel: 'RAlt', defaultCode: 'AltRight', width: 1.25, category: 'modifier' },
    { id: 'Fn1', row: 5, col: 5, defaultLabel: 'Fn', defaultCode: 'Fn1', width: 1.25, category: 'system' },
    { id: 'ContextMenu', row: 5, col: 6, defaultLabel: 'Menu', defaultCode: 'ContextMenu', width: 1.25, category: 'modifier' },
    { id: 'ControlRight', row: 5, col: 7, defaultLabel: 'RCtrl', defaultCode: 'ControlRight', width: 1.25, category: 'modifier' },
    { id: 'ArrowLeft', row: 5, col: 8, defaultLabel: '←', defaultCode: 'ArrowLeft', width: 1, gapBefore: 0.35, category: 'navigation' },
    { id: 'ArrowDown', row: 5, col: 9, defaultLabel: '↓', defaultCode: 'ArrowDown', width: 1, category: 'navigation' },
    { id: 'ArrowRight', row: 5, col: 10, defaultLabel: '→', defaultCode: 'ArrowRight', width: 1, category: 'navigation' },
  ];

  if (formFactor === 'tkl') {
    return [tklRow0, tklRow1, tklRow2, tklRow3, tklRow4, tklRow5];
  }

  // 100% Full Size adds Numpad
  return [
    [
      ...tklRow0,
      { id: 'MediaPlayPause', row: 0, col: 16, defaultLabel: 'Play', defaultCode: 'MediaPlayPause', width: 1, gapBefore: 0.35, category: 'system' },
      { id: 'AudioVolumeDown', row: 0, col: 17, defaultLabel: 'Vol-', defaultCode: 'AudioVolumeDown', width: 1, category: 'system' },
      { id: 'AudioVolumeUp', row: 0, col: 18, defaultLabel: 'Vol+', defaultCode: 'AudioVolumeUp', width: 1, category: 'system' },
      { id: 'AudioVolumeMute', row: 0, col: 19, defaultLabel: 'Mute', defaultCode: 'AudioVolumeMute', width: 1, category: 'system' },
    ],
    [
      ...tklRow1,
      { id: 'NumLock', row: 1, col: 17, defaultLabel: 'Num', defaultCode: 'NumLock', width: 1, gapBefore: 0.35, category: 'numpad' },
      { id: 'NumpadDivide', row: 1, col: 18, defaultLabel: '/', defaultCode: 'NumpadDivide', width: 1, category: 'numpad' },
      { id: 'NumpadMultiply', row: 1, col: 19, defaultLabel: '*', defaultCode: 'NumpadMultiply', width: 1, category: 'numpad' },
      { id: 'NumpadSubtract', row: 1, col: 20, defaultLabel: '-', defaultCode: 'NumpadSubtract', width: 1, category: 'numpad' },
    ],
    [
      ...tklRow2,
      { id: 'Numpad7', row: 2, col: 17, defaultLabel: '7', defaultCode: 'Numpad7', width: 1, gapBefore: 0.35, category: 'numpad' },
      { id: 'Numpad8', row: 2, col: 18, defaultLabel: '8', defaultCode: 'Numpad8', width: 1, category: 'numpad' },
      { id: 'Numpad9', row: 2, col: 19, defaultLabel: '9', defaultCode: 'Numpad9', width: 1, category: 'numpad' },
      { id: 'NumpadAdd', row: 2, col: 20, defaultLabel: '+', defaultCode: 'NumpadAdd', width: 1, category: 'numpad' },
    ],
    [
      ...tklRow3,
      { id: 'Numpad4', row: 3, col: 13, defaultLabel: '4', defaultCode: 'Numpad4', width: 1, gapBefore: 3.7, category: 'numpad' },
      { id: 'Numpad5', row: 3, col: 14, defaultLabel: '5', defaultCode: 'Numpad5', width: 1, category: 'numpad' },
      { id: 'Numpad6', row: 3, col: 15, defaultLabel: '6', defaultCode: 'Numpad6', width: 1, category: 'numpad' },
      { id: 'NumpadEqual', row: 3, col: 16, defaultLabel: '=', defaultCode: 'NumpadEqual', width: 1, category: 'numpad' },
    ],
    [
      ...tklRow4,
      { id: 'Numpad1', row: 4, col: 13, defaultLabel: '1', defaultCode: 'Numpad1', width: 1, gapBefore: 1.35, category: 'numpad' },
      { id: 'Numpad2', row: 4, col: 14, defaultLabel: '2', defaultCode: 'Numpad2', width: 1, category: 'numpad' },
      { id: 'Numpad3', row: 4, col: 15, defaultLabel: '3', defaultCode: 'Numpad3', width: 1, category: 'numpad' },
      { id: 'NumpadEnter', row: 4, col: 16, defaultLabel: 'Ent', defaultCode: 'NumpadEnter', width: 1, category: 'numpad' },
    ],
    [
      ...tklRow5,
      { id: 'Numpad0', row: 5, col: 11, defaultLabel: '0', defaultCode: 'Numpad0', width: 2, gapBefore: 0.35, category: 'numpad' },
      { id: 'NumpadDecimal', row: 5, col: 12, defaultLabel: '.', defaultCode: 'NumpadDecimal', width: 1, category: 'numpad' },
      { id: 'Calculator', row: 5, col: 13, defaultLabel: 'Calc', defaultCode: 'Calculator', width: 1, category: 'numpad' },
    ],
  ];
}

export function getAllKeysForLayout(formFactor: FormFactor): KeyCapDefinition[] {
  return getLayoutRows(formFactor).flat();
}

export const SIMULATOR_DEVICES: ConnectedDeviceInfo[] = [
  {
    id: 'sim-wooting-60he',
    name: 'Wooting 60HE+ Module',
    vendorName: 'Wooting',
    vendorId: 0x31e3,
    productId: 0x1312,
    connectionMode: 'simulator',
    transport: 'USB-C Wired (8K)',
    firmwareVersion: 'v2.9.4-lekker',
    pcbSensor: 'TI DRV5055 Hall-Effect Matrix (0.05mm)',
    switchType: 'Lekker L45 v2 Magnetic (0.1–4.0mm)',
    batteryPercent: null,
    charging: false,
    formFactor: '60%',
    supportsMagnetic: true,
  },
  {
    id: 'sim-keychron-q1-he',
    name: 'Keychron Q1 HE Wireless',
    vendorName: 'Keychron',
    vendorId: 0x3434,
    productId: 0x0b10,
    connectionMode: 'simulator',
    transport: '2.4GHz Dongle (4K)',
    firmwareVersion: 'v1.4.2-qmk-he',
    pcbSensor: 'Gateron Dual-Rail Magnetic Hall ADC',
    switchType: 'Gateron Double-Rail Nebula Magnetic',
    batteryPercent: 92,
    charging: false,
    formFactor: '75%',
    supportsMagnetic: true,
  },
  {
    id: 'sim-wuque-freya-tkl',
    name: 'Wuque Studio Freya Ultra HE',
    vendorName: 'Wuque Studio',
    vendorId: 0x3554,
    productId: 0xf592,
    connectionMode: 'simulator',
    transport: 'USB-C Wired (8K)',
    firmwareVersion: 'v3.1.0-wuque',
    pcbSensor: 'Wuque Custom 16-bit Hall ADC',
    switchType: 'WS Flux HE Linear Switch',
    batteryPercent: 100,
    charging: true,
    formFactor: 'tkl',
    supportsMagnetic: true,
  },
  {
    id: 'sim-nuphy-field75-he',
    name: 'NuPhy Field75 HE',
    vendorName: 'NuPhy',
    vendorId: 0x19f5,
    productId: 0x3245,
    connectionMode: 'simulator',
    transport: 'USB-C Wired (8K)',
    firmwareVersion: 'v2.0.8-nuphyio',
    pcbSensor: 'NuPhy Magnetic Pro 8000Hz Engine',
    switchType: 'Magnetic Jade Gaming Switch',
    batteryPercent: null,
    charging: false,
    formFactor: '75%',
    supportsMagnetic: true,
  },
  {
    id: 'sim-keychron-q6-max',
    name: 'Keychron Q6 Max (Full-Size QMK)',
    vendorName: 'Keychron',
    vendorId: 0x3434,
    productId: 0x0660,
    connectionMode: 'simulator',
    transport: '2.4GHz Dongle (4K)',
    firmwareVersion: 'v1.2.0-via',
    pcbSensor: 'STM32F402 ARM Cortex-M4 Matrix',
    switchType: 'Gateron Jupiter Banana Tactile',
    batteryPercent: 78,
    charging: false,
    formFactor: '100%',
    supportsMagnetic: true,
  },
];

export const KEYCODE_PALETTE: {
  category: string;
  items: { code: string; label: string; description?: string }[];
}[] = [
  {
    category: 'Alphanumeric & Punctuation',
    items: [
      { code: 'KeyA', label: 'A' },
      { code: 'KeyB', label: 'B' },
      { code: 'KeyC', label: 'C' },
      { code: 'KeyD', label: 'D' },
      { code: 'KeyE', label: 'E' },
      { code: 'KeyF', label: 'F' },
      { code: 'KeyG', label: 'G' },
      { code: 'KeyH', label: 'H' },
      { code: 'KeyI', label: 'I' },
      { code: 'KeyJ', label: 'J' },
      { code: 'KeyK', label: 'K' },
      { code: 'KeyL', label: 'L' },
      { code: 'KeyM', label: 'M' },
      { code: 'KeyN', label: 'N' },
      { code: 'KeyO', label: 'O' },
      { code: 'KeyP', label: 'P' },
      { code: 'KeyQ', label: 'Q' },
      { code: 'KeyR', label: 'R' },
      { code: 'KeyS', label: 'S' },
      { code: 'KeyT', label: 'T' },
      { code: 'KeyU', label: 'U' },
      { code: 'KeyV', label: 'V' },
      { code: 'KeyW', label: 'W' },
      { code: 'KeyX', label: 'X' },
      { code: 'KeyY', label: 'Y' },
      { code: 'KeyZ', label: 'Z' },
      { code: 'Digit1', label: '1 !' },
      { code: 'Digit2', label: '2 @' },
      { code: 'Digit3', label: '3 #' },
      { code: 'Digit4', label: '4 $' },
      { code: 'Digit5', label: '5 %' },
      { code: 'Digit6', label: '6 ^' },
      { code: 'Digit7', label: '7 &' },
      { code: 'Digit8', label: '8 *' },
      { code: 'Digit9', label: '9 (' },
      { code: 'Digit0', label: '0 )' },
      { code: 'Space', label: 'Space' },
      { code: 'Enter', label: 'Enter' },
      { code: 'Escape', label: 'Esc' },
      { code: 'Backspace', label: 'Backspace' },
      { code: 'Tab', label: 'Tab' },
    ],
  },
  {
    category: 'Modifiers & Hyper Keys',
    items: [
      { code: 'ShiftLeft', label: 'LShift' },
      { code: 'ShiftRight', label: 'RShift' },
      { code: 'ControlLeft', label: 'LCtrl' },
      { code: 'ControlRight', label: 'RCtrl' },
      { code: 'AltLeft', label: 'LAlt' },
      { code: 'AltRight', label: 'RAlt' },
      { code: 'MetaLeft', label: 'Win / Cmd' },
      { code: 'CapsLock', label: 'CapsLock' },
      { code: 'HYPR', label: 'Hyper (Ctrl+Alt+Shift+Gui)', description: 'All 4 modifiers combined' },
      { code: 'MEH', label: 'Meh (Ctrl+Alt+Shift)', description: 'Shortcut modifier without OS key' },
      { code: 'MT_CTRL_ESC', label: 'MT(Ctrl/Esc)', description: 'Hold for LCtrl, Tap for Escape' },
    ],
  },
  {
    category: 'Fn & Layer Control',
    items: [
      { code: 'MO(1)', label: 'MO(1)', description: 'Momentary hold Layer 1' },
      { code: 'MO(2)', label: 'MO(2)', description: 'Momentary hold Layer 2' },
      { code: 'MO(3)', label: 'MO(3)', description: 'Momentary hold Layer 3' },
      { code: 'TG(1)', label: 'TG(1)', description: 'Toggle Layer 1 On/Off' },
      { code: 'TG(2)', label: 'TG(2)', description: 'Toggle Layer 2 On/Off' },
      { code: 'DF(0)', label: 'DF(0)', description: 'Set Default Base Layer 0' },
      { code: 'TRNS', label: '▽ Trans', description: 'Pass-through to lower layer' },
    ],
  },
  {
    category: 'Navigation & Function',
    items: [
      { code: 'ArrowUp', label: '↑ Up' },
      { code: 'ArrowDown', label: '↓ Down' },
      { code: 'ArrowLeft', label: '← Left' },
      { code: 'ArrowRight', label: '→ Right' },
      { code: 'Home', label: 'Home' },
      { code: 'End', label: 'End' },
      { code: 'PageUp', label: 'PgUp' },
      { code: 'PageDown', label: 'PgDn' },
      { code: 'Insert', label: 'Ins' },
      { code: 'Delete', label: 'Del' },
      { code: 'F1', label: 'F1' },
      { code: 'F2', label: 'F2' },
      { code: 'F3', label: 'F3' },
      { code: 'F4', label: 'F4' },
      { code: 'F5', label: 'F5' },
      { code: 'F6', label: 'F6' },
      { code: 'F7', label: 'F7' },
      { code: 'F8', label: 'F8' },
      { code: 'F9', label: 'F9' },
      { code: 'F10', label: 'F10' },
      { code: 'F11', label: 'F11' },
      { code: 'F12', label: 'F12' },
    ],
  },
  {
    category: 'Media, RGB & Hardware',
    items: [
      { code: 'AudioVolumeUp', label: 'Vol +' },
      { code: 'AudioVolumeDown', label: 'Vol -' },
      { code: 'AudioVolumeMute', label: 'Mute' },
      { code: 'MediaPlayPause', label: 'Play/Pause' },
      { code: 'MediaTrackNext', label: 'Next Track' },
      { code: 'MediaTrackPrevious', label: 'Prev Track' },
      { code: 'RGB_TOG', label: 'RGB Toggle' },
      { code: 'RGB_MOD', label: 'RGB Mode+' },
      { code: 'RGB_VAI', label: 'Bright+' },
      { code: 'RGB_VAD', label: 'Bright-' },
      { code: 'NKRO_TOG', label: 'NKRO Toggle' },
    ],
  },
  {
    category: 'Hardware Macros (M1–M8)',
    items: [
      { code: 'MACRO_1', label: 'M1', description: 'Execute Macro Slot 1' },
      { code: 'MACRO_2', label: 'M2', description: 'Execute Macro Slot 2' },
      { code: 'MACRO_3', label: 'M3', description: 'Execute Macro Slot 3' },
      { code: 'MACRO_4', label: 'M4', description: 'Execute Macro Slot 4' },
      { code: 'MACRO_5', label: 'M5', description: 'Execute Macro Slot 5' },
      { code: 'MACRO_6', label: 'M6', description: 'Execute Macro Slot 6' },
      { code: 'MACRO_7', label: 'M7', description: 'Execute Macro Slot 7' },
      { code: 'MACRO_8', label: 'M8', description: 'Execute Macro Slot 8' },
    ],
  },
];

export const DEFAULT_GLOBAL_TRIGGER: PerKeyTriggerConfig = {
  actuationMm: 1.8,
  rapidTrigger: false,
  rtPressMm: 0.3,
  rtReleaseMm: 0.3,
  continuousRt: false,
  topDeadzoneMm: 0.2,
  bottomDeadzoneMm: 0.2,
};

export const DEFAULT_MACROS: MacroSlot[] = [
  {
    slot: 1,
    name: 'CS2 / Valorant Instant Drop-Weapon',
    mode: 'once',
    repeatCount: 1,
    assignedKeyId: 'KeyG',
    steps: [
      { id: 's1', action: 'down', keyCode: 'Digit3', keyLabel: '3 (Knife)', delayMs: 12 },
      { id: 's2', action: 'up', keyCode: 'Digit3', keyLabel: '3 (Knife)', delayMs: 15 },
      { id: 's3', action: 'down', keyCode: 'Digit1', keyLabel: '1 (Primary)', delayMs: 12 },
      { id: 's4', action: 'up', keyCode: 'Digit1', keyLabel: '1 (Primary)', delayMs: 12 },
      { id: 's5', action: 'tap', keyCode: 'KeyG', keyLabel: 'G (Drop)', delayMs: 10 },
    ],
  },
  {
    slot: 2,
    name: 'Git Commit & Push Burst',
    mode: 'once',
    repeatCount: 1,
    steps: [
      { id: 'g1', action: 'down', keyCode: 'ControlLeft', keyLabel: 'LCtrl', delayMs: 10 },
      { id: 'g2', action: 'tap', keyCode: 'KeyS', keyLabel: 'S (Save)', delayMs: 25 },
      { id: 'g3', action: 'up', keyCode: 'ControlLeft', keyLabel: 'LCtrl', delayMs: 15 },
    ],
  },
  {
    slot: 3,
    name: 'Rapid Melee / Crouch Jump',
    mode: 'once',
    repeatCount: 1,
    steps: [
      { id: 'c1', action: 'down', keyCode: 'Space', keyLabel: 'Space', delayMs: 8 },
      { id: 'c2', action: 'down', keyCode: 'ControlLeft', keyLabel: 'LCtrl', delayMs: 18 },
      { id: 'c3', action: 'up', keyCode: 'Space', keyLabel: 'Space', delayMs: 12 },
      { id: 'c4', action: 'up', keyCode: 'ControlLeft', keyLabel: 'LCtrl', delayMs: 10 },
    ],
  },
  { slot: 4, name: 'Macro Slot 4', mode: 'once', repeatCount: 1, steps: [] },
  { slot: 5, name: 'Macro Slot 5', mode: 'once', repeatCount: 1, steps: [] },
  { slot: 6, name: 'Macro Slot 6', mode: 'once', repeatCount: 1, steps: [] },
  { slot: 7, name: 'Macro Slot 7', mode: 'once', repeatCount: 1, steps: [] },
  { slot: 8, name: 'Macro Slot 8', mode: 'once', repeatCount: 1, steps: [] },
];

export function createDefaultProfile(): KeyboardProfile {
  const wasdTrigger: PerKeyTriggerConfig = {
    actuationMm: 0.4,
    rapidTrigger: true,
    rtPressMm: 0.15,
    rtReleaseMm: 0.15,
    continuousRt: true,
    topDeadzoneMm: 0.1,
    bottomDeadzoneMm: 0.15,
  };

  return {
    id: 'profile-fps-pro',
    name: 'Esports Tac-FPS (Snap Tap + 0.15mm RT)',
    description: 'Ultra-low latency 8000Hz profile with 0.4mm WASD actuation, 0.15mm Continuous Rapid Trigger, and A+D Snap Tap.',
    genreTag: 'FPS',
    updatedAt: new Date().toISOString(),
    formFactor: '75%',
    systemMode: 'win',
    pollingRateHz: 8000,
    tachyonLowLatency: true,
    sleepMinutes: 15,
    nkroEnabled: true,
    debounceMs: 0,
    globalTrigger: { ...DEFAULT_GLOBAL_TRIGGER },
    perKeyTriggers: {
      KeyW: { ...wasdTrigger },
      KeyA: { ...wasdTrigger },
      KeyS: { ...wasdTrigger },
      KeyD: { ...wasdTrigger },
      ShiftLeft: {
        actuationMm: 0.8,
        rapidTrigger: true,
        rtPressMm: 0.2,
        rtReleaseMm: 0.2,
        continuousRt: false,
        topDeadzoneMm: 0.15,
        bottomDeadzoneMm: 0.2,
      },
      Space: {
        actuationMm: 1.2,
        rapidTrigger: true,
        rtPressMm: 0.25,
        rtReleaseMm: 0.2,
        continuousRt: false,
        topDeadzoneMm: 0.2,
        bottomDeadzoneMm: 0.2,
      },
    },
    socdPairs: [
      {
        id: 'socd-ad',
        name: 'Counter-Strafe Horizontal (A + D)',
        key1Id: 'KeyA',
        key2Id: 'KeyD',
        mode: 'last_priority',
        enabled: true,
      },
      {
        id: 'socd-ws',
        name: 'Forward / Back Stop (W + S)',
        key1Id: 'KeyW',
        key2Id: 'KeyS',
        mode: 'last_priority',
        enabled: false,
      },
    ],
    dksBindings: [
      {
        id: 'dks-walk-sprint',
        keyId: 'KeyW',
        enabled: false,
        stage1Down15mm: 'KeyW (Walk)',
        stage2Bottom36mm: 'LShift + KeyW (Sprint)',
        stage3Up36mm: 'Release LShift',
        stage4Release15mm: 'Release KeyW',
      },
    ],
    layers: {
      0: {},
      1: {
        KeyI: '↑ Up',
        KeyJ: '← Left',
        KeyK: '↓ Down',
        KeyL: '→ Right',
        Digit1: 'F1',
        Digit2: 'F2',
        Digit3: 'F3',
        Digit4: 'F4',
        Digit5: 'F5',
        Digit6: 'F6',
        Digit7: 'F7',
        Digit8: 'F8',
        Digit9: 'F9',
        Digit0: 'F10',
        Minus: 'F11',
        Equal: 'F12',
        Backspace: 'Del',
      },
      2: {
        KeyQ: 'M1',
        KeyW: 'M2',
        KeyE: 'M3',
        KeyM: 'Mute',
      },
      3: {},
    },
    lighting: {
      effect: 'wave_spectrum',
      brightness: 88,
      speed: 62,
      direction: 'left_to_right',
      primaryHex: '#5dde89',
      secondaryHex: '#60a5fa',
      underglowEnabled: true,
      underglowHex: '#5dde89',
      perKeyColors: {
        KeyW: '#5dde89',
        KeyA: '#5dde89',
        KeyS: '#5dde89',
        KeyD: '#5dde89',
        Escape: '#f43f5e',
        Space: '#60a5fa',
      },
    },
    macros: DEFAULT_MACROS,
  };
}

export const PRESET_PROFILES: KeyboardProfile[] = [
  createDefaultProfile(),
  {
    ...createDefaultProfile(),
    id: 'profile-rhythm-osu',
    name: 'Osu! / Rhythm Hyper-Trigger (0.1mm RT)',
    description: 'Hair-trigger 0.2mm actuation and 0.1mm Continuous Rapid Trigger on Z/X/C/V and S/D/K/L for maximum streaming BPM.',
    genreTag: 'Rhythm',
    perKeyTriggers: {
      KeyZ: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
      KeyX: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
      KeyS: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
      KeyD: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
      KeyK: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
      KeyL: { actuationMm: 0.2, rapidTrigger: true, rtPressMm: 0.1, rtReleaseMm: 0.1, continuousRt: true, topDeadzoneMm: 0.05, bottomDeadzoneMm: 0.1 },
    },
    lighting: {
      effect: 'reactive_ripple',
      brightness: 95,
      speed: 85,
      direction: 'center_out',
      primaryHex: '#f472b6',
      secondaryHex: '#38bdf8',
      underglowEnabled: true,
      underglowHex: '#f472b6',
      perKeyColors: {
        KeyZ: '#f472b6',
        KeyX: '#f472b6',
        KeyS: '#38bdf8',
        KeyD: '#38bdf8',
        KeyK: '#38bdf8',
        KeyL: '#38bdf8',
      },
    },
  },
  {
    ...createDefaultProfile(),
    id: 'profile-coding-vim',
    name: 'Software Engineering & Neovim Ergo',
    description: '2.0mm deliberate actuation to eliminate typos, CapsLock remapped to MT(Ctrl/Esc), and warm low-glare studio backlighting.',
    genreTag: 'Coding',
    pollingRateHz: 1000,
    tachyonLowLatency: false,
    globalTrigger: {
      actuationMm: 2.0,
      rapidTrigger: false,
      rtPressMm: 0.4,
      rtReleaseMm: 0.4,
      continuousRt: false,
      topDeadzoneMm: 0.3,
      bottomDeadzoneMm: 0.3,
    },
    perKeyTriggers: {},
    socdPairs: [],
    layers: {
      0: {
        CapsLock: 'MT(Ctrl/Esc)',
      },
      1: {
        KeyH: '← Left',
        KeyJ: '↓ Down',
        KeyK: '↑ Up',
        KeyL: '→ Right',
      },
      2: {},
      3: {},
    },
    lighting: {
      effect: 'static_solid',
      brightness: 55,
      speed: 30,
      direction: 'left_to_right',
      primaryHex: '#fbbf24',
      secondaryHex: '#38bdf8',
      underglowEnabled: true,
      underglowHex: '#f59e0b',
      perKeyColors: {},
    },
  },
];
