# Treesitter Textobjects Cheatsheet

These work like built-in vim textobjects (`w`, `p`, `"`, etc.) but for code structures.

## Select/Operate on Code

| Keymap | Target | Example usage |
|--------|--------|---------------|
| `af` | **a** **f**unction (outer) | `vaf` select whole function, `daf` delete it, `caf` change it |
| `if` | **i**nner **f**unction (body only) | `vif` select function body, `dif` delete body |
| `ac` | **a** **c**lass (outer) | `vac` select whole class |
| `ic` | **i**nner **c**lass | `vic` select class body |
| `aa` | **a** **a**rgument/parameter | `vaa` select param including comma |
| `ia` | **i**nner **a**rgument | `via` select just the param value |

### Examples

```lua
-- cursor here: function foo(ba|r, baz)
-- `daa` deletes "bar, " → function foo(baz)
-- `cia` changes "bar" → function foo(|, baz)

-- cursor inside function body
-- `vaf` selects entire function including signature
-- `vif` selects just the body
```

## Movement

| Keymap | Action |
|--------|--------|
| `]m` | Jump to next function start |
| `]M` | Jump to next function end |
| `[m` | Jump to prev function start |
| `[M` | Jump to prev function end |
| `]]` | Jump to next class start |
| `[[` | Jump to prev class start |
| `][` | Jump to next class end |
| `[]` | Jump to prev class end |

### Normal Mode - Jump Cursor

```
]m   →  jump to NEXT function START
]M   →  jump to NEXT function END
[m   →  jump to PREV function START
[M   →  jump to PREV function END

]]   →  jump to NEXT class START
][   →  jump to NEXT class END
[[   →  jump to PREV class START
[]   →  jump to PREV class END
```

### Example

```lua
function foo()    -- [m jumps here (prev function start)
  print("a")
end               -- [M jumps here (prev function end)

function bar()    -- cursor here
  print("b")
end

function baz()    -- ]m jumps here (next function start)
  print("c")
end               -- ]M jumps here (next function end)
```

### Visual Mode - Extend Selection

Press `v` then `]m` repeatedly to extend selection to include next functions.

### Operator-Pending Mode - Operate to Target

| Command | Effect |
|---------|--------|
| `d]m` | Delete from cursor to next function start |
| `c]m` | Change from cursor to next function start |
| `y]]` | Yank from cursor to next class start |

## Mnemonic

- `]` = forward, `[` = backward
- `m` = **m**ethod/function
- `]` = class (think `]]` like "next block")
- Lowercase = start, Uppercase = end
