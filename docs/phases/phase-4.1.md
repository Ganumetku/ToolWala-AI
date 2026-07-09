# Phase 4.1: Native PDF Engine Architecture Upgrade

This phase implements structural refactorings to support polymorphic text editing, transactional states history tracking, and linear algebra math.

---

## 🎯 Purpose and Goals
* Model core types inheriting from a common base `TWObject`.
* Implement standard transaction histories (`originalState`, `currentState`, `editedState`) to preserve raw PDF parameters.
* Introduce an `ObjectRegistry` singleton cache and auto-dirty tracking.
* Construct linear algebra matrix utilities and geometry snapped calculators.
* Harvest font subset encodings and metadata.

---

## 📂 Files Added & Modified
* `types.ts`: Shared model interfaces.
* `ObjectRegistry.ts`: Singleton transaction store.
* `Matrix.ts`: Affine matrix operations.
* `Geometry.ts`: Rotations and snap check helpers.
* `FontParser.ts`: Scans font subset details.

---

## 📐 Architecture & Verification
* Core model properties are typed cleanly.
* Validated via `scratch/verify_parser.ts` asserting registry insertions, matrix operations, and dirty flags updates.
