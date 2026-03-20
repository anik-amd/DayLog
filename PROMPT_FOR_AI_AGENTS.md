# Reference Files Location

All project instructions, architecture, and roadmap documents are located in the `/instructions` folder.  

AI agents **must read and follow** these files before generating or modifying any code:

- `/instructions/DAYLOG_SPEC.md` – Philosophy & Features
- `/instructions/DAYLOG_TECHNICAL_ARCHITECTURE.md` – Technical Architecture
- `/instructions/DAYLOG_FEATURE_ROADMAP.md` – Step-by-step Build Order

Agents **must not ignore** these files. Always check here first before writing code.

# DayLog – Master Prompt for AI Agents

This document is the main instruction file for AI agents working on the DayLog project.

The agent must read this file before generating any code.

---

# 1. Project Overview

You are helping build a mobile diary application called **DayLog**.

DayLog is not a traditional journaling app. It is designed to allow users to **capture thoughts instantly** and organize them automatically in a timeline.

The most important feature of the app is **quick entry**, not complex writing tools.

The application must remain minimal, fast, and distraction-free at all times.

---

# 2. Core Philosophy

The agent must follow these rules while generating code:

1. Keep everything minimal
2. Do not over-engineer
3. Avoid unnecessary libraries
4. Prefer simple logic over complex logic
5. Focus on speed and performance
6. Always prioritize the quick-entry experience
7. Do not add features that are not defined in the roadmap
8. The app must work offline first

If a feature is not required, do not implement it.

---

# 3. Technology Stack (Must Follow Strictly)

The project must use the following technologies:

- React Native
- Expo (managed workflow)
- TypeScript
- NativeWind (Tailwind for React Native)
- React Navigation
- SQLite (local storage)
- Local file storage for media
- Markdown-based content system

The agent must not introduce additional UI frameworks such as:

- Material UI
- Chakra UI
- DaisyUI
- Bootstrap-based libraries
- Any heavy UI library

The UI must be built manually using Tailwind classes.

---

# 4. Application Goal

The final application must feel:

- very fast
- minimal
- clean
- calm
- distraction-free
- reliable
- easy to use daily

This is more important than having many features.

---

# 5. Feature Priority

The agent must focus on features in this order:

1. Local database
2. Timeline screen
3. Quick entry bar
4. Auto-save system
5. Full screen editor
6. Markdown support
7. Media support
8. Mini calendar
9. Settings page
10. Google Drive backup
11. Performance optimization
12. Android widget

Do not implement advanced features before the basic system is stable.

---

# 6. Quick Entry System (Most Important Feature)

The quick entry system must work like a messaging input box.

Behaviour rules:

- The user should be able to open the app and start typing immediately
- A small input bar must appear at the bottom of the screen
- If the text becomes longer, the input must expand automatically
- If the user presses the expand arrow, the editor must open in full screen
- The entry must be auto-saved automatically
- The user must never need to press a save button

If the quick entry system does not feel fast, the implementation is wrong.

---

# 7. Code Structure Rules

The agent must follow a clean folder structure.

Main folders:

- app/
- components/
- database/
- storage/
- markdown/
- hooks/
- types/

The agent must not place everything inside one folder.

---

# 8. Coding Rules

The agent must:

- Use functional components only
- Use TypeScript for all files
- Avoid class components
- Avoid unnecessary abstraction
- Avoid very long files
- Write reusable components when needed
- Use hooks instead of complex logic

---

# 9. Performance Rules

The agent must:

- Avoid unnecessary re-renders
- Use FlatList for the timeline
- Avoid heavy animations
- Avoid large dependencies
- Ensure smooth scrolling
- Ensure the app opens quickly

---

# 10. Storage Rules

The app must be offline-first.

Required behaviour:

- All entries must be saved locally
- Media must be saved locally
- The app must work without internet
- Internet must only be used for backup

---

# 11. Markdown Rules

Entries must be saved as Markdown text.

The agent must not convert Markdown to HTML before saving.

Markdown must remain editable at all times.

---

# 12. What the Agent Must NOT Do

The agent must NOT:

- Add unnecessary features
- Add user accounts
- Add cloud sync (except Google Drive backup)
- Add analytics
- Add notifications
- Add complex settings
- Add unnecessary UI animations
- Add third-party diary features
- Commit or push code unless explicitly asked by the user

If a feature is not in the roadmap, do not implement it.

# Git Safety Protocol
- NEVER commit unless the user says "commit it" or similar explicit instruction
- If you finish work and haven't been asked to commit, just stop and say you're done
- Never auto-commit after making changes

---

# 13. How the Agent Should Work

The agent must:

1. Work step-by-step
2. Implement only one feature at a time
3. Test basic functionality before moving forward
4. Avoid rewriting working code unnecessarily
5. Keep the code clean and readable
6. Always follow the architecture file

---

# 14. Final Objective

The goal is not to build a complex app.

The goal is to build a **fast, minimal diary tool** that people can use every day without effort.

If the app becomes complicated, the implementation has failed.
