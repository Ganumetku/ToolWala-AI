# Object Registry Module

The `ObjectRegistry` singleton is the central source of truth caching all parsed document elements.

---

## 📋 Responsibilities
* Manage current, original, and edited states caches.
* Support object updates, registration, and removals.
* Track modified elements through auto-dirty triggers.

---

## 🛠 Public API Reference
* `ObjectRegistry.getInstance(): ObjectRegistry`: Singleton getter.
* `ObjectRegistry.registerObject(obj: TWObject): void`: Cache new elements.
* `ObjectRegistry.updateObject(id: string, updates: Partial<TWObject>): void`: Apply transforms and trigger dirty states.
* `ObjectRegistry.getObjectsByPage(pageNumber: number): TWObject[]`: Query active objects sorted by zIndex.
* `ObjectRegistry.getDirtyObjects(): TWObject[]`: Retrieve elements with pending updates.

---

## 🔄 Internal States Flow
```
Register -> originalState (Locked) & currentState (Mutable)
Update -> currentState & editedState updated -> isDirty = true
```
Modifications to objects write directly to `currentState` and `editedState`, leaving the original PDF coordinates in `originalState` untouched.
