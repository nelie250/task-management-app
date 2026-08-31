import test from "node:test";
import assert from "node:assert/strict";

import { filterTasks } from "./useFilteredTasks.js";

test("filterTasks handles missing tasks and malformed task data safely", () => {
  assert.deepEqual(filterTasks(undefined, "all", ""), []);
  assert.deepEqual(filterTasks(null, "active", "plan"), []);
  assert.deepEqual(
    filterTasks(
      [
        { title: "Plan sprint", completed: false, priority: "high" },
        { title: "Ship feature", completed: true, priority: "low" },
        { title: "Read docs", completed: false, priority: "medium" },
        { completed: true },
      ],
      "active",
      "plan",
    ),
    [{ title: "Plan sprint", completed: false, priority: "high" }],
  );
});
