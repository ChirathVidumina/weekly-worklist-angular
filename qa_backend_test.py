import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:8080/api/v1"

results = []

def record(test_id, module, scenario, expected, actual, status, details=""):
    results.append({
        "id": test_id,
        "module": module,
        "scenario": scenario,
        "expected": expected,
        "actual": actual,
        "status": status,
        "details": details
    })
    symbol = "✅" if status == "PASS" else "❌"
    print(f"{symbol} [{test_id}] {scenario} -> {status}")
    if status == "FAIL" and details:
        print(f"   Details: {details}")

def request(method, path, body=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.getcode()
            resp_body = resp.read().decode("utf-8")
            json_resp = json.loads(resp_body) if resp_body else None
            return status_code, json_resp
    except urllib.error.HTTPError as e:
        status_code = e.code
        err_body = e.read().decode("utf-8")
        try:
            json_err = json.loads(err_body)
        except Exception:
            json_err = err_body
        return status_code, json_err
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("=" * 60)
    print("STARTING BACKEND LIVE REST API & MONGO ATLAS PERSISTENCE TESTS")
    print("=" * 60)

    # 1. GET /categories
    code, data = request("GET", "/categories")
    if code == 200 and isinstance(data, list) and len(data) >= 4:
        has_ids = all("id" in c and len(c["id"]) > 5 for c in data)
        names = [c["name"] for c in data]
        if has_ids and "Work" in names and "Study" in names:
            record("API-CAT-01", "Categories API", "Fetch default categories from MongoDB Atlas",
                   "200 OK with >= 4 default categories with valid IDs",
                   f"200 OK, {len(data)} categories found: {names}", "PASS")
        else:
            record("API-CAT-01", "Categories API", "Fetch default categories from MongoDB Atlas",
                   "Valid IDs and default names", f"Missing names or IDs: {data}", "FAIL")
    else:
        record("API-CAT-01", "Categories API", "Fetch default categories from MongoDB Atlas",
               "200 OK with list", f"Status {code}, data: {data}", "FAIL")

    default_cat_id = data[0]["id"] if (isinstance(data, list) and data) else None

    # 2. POST /categories (Valid)
    cat_payload = {"name": "QA Testing", "color": "#10B981"}
    code, data = request("POST", "/categories", cat_payload)
    custom_cat_id = None
    if code == 201 and data.get("name") == "QA Testing" and data.get("id"):
        custom_cat_id = data["id"]
        record("API-CAT-02", "Categories API", "Create custom category with valid hex color",
               "201 Created with generated ID", f"201 Created, ID={custom_cat_id}", "PASS")
    else:
        record("API-CAT-02", "Categories API", "Create custom category with valid hex color",
               "201 Created", f"Status {code}, data: {data}", "FAIL")

    # 3. POST /categories (Duplicate Name Rejection)
    code, data = request("POST", "/categories", cat_payload)
    if code == 409:
        record("API-CAT-03", "Categories API", "Duplicate category name rejection",
               "409 Conflict with error DUPLICATE_RESOURCE", f"409 Conflict: {data.get('message', '')}", "PASS")
    else:
        record("API-CAT-03", "Categories API", "Duplicate category name rejection",
               "409 Conflict", f"Status {code}, data: {data}", "FAIL")

    # 4. POST /categories (Invalid Hex Color Validation)
    bad_color_payload = {"name": "Bad Color", "color": "not-a-hex"}
    code, data = request("POST", "/categories", bad_color_payload)
    if code == 400 and data.get("error") == "VALIDATION_FAILED":
        record("API-CAT-04", "Categories API", "Validation failure for invalid color format",
               "400 Bad Request with field error on 'color'", f"400 Bad Request: {data.get('fieldErrors', {})}", "PASS")
    else:
        record("API-CAT-04", "Categories API", "Validation failure for invalid color format",
               "400 Bad Request", f"Status {code}, data: {data}", "FAIL")

    # 5. PUT /categories/{id} (Update Name & Color)
    if custom_cat_id:
        update_cat_payload = {"name": "QA Automation & Verification", "color": "#6366F1"}
        code, data = request("PUT", f"/categories/{custom_cat_id}", update_cat_payload)
        if code == 200 and data.get("name") == "QA Automation & Verification" and data.get("color") == "#6366F1":
            record("API-CAT-05", "Categories API", "Update existing custom category name and color",
                   "200 OK with updated attributes", "200 OK, attributes updated", "PASS")
        else:
            record("API-CAT-05", "Categories API", "Update existing custom category name and color",
                   "200 OK", f"Status {code}, data: {data}", "FAIL")

    # 6. DELETE /categories/{id} for Default Category (Protection)
    if default_cat_id:
        code, data = request("DELETE", f"/categories/{default_cat_id}")
        if code == 400:
            record("API-CAT-06", "Categories API", "Protection against deleting default system categories",
                   "400 Bad Request preventing default category deletion",
                   f"400 Bad Request: {data.get('message', '')}", "PASS")
        else:
            record("API-CAT-06", "Categories API", "Protection against deleting default system categories",
                   "400 Bad Request", f"Status {code}, data: {data}", "FAIL")

    # 7. POST /tasks (Validation: Empty Title)
    empty_task_payload = {"title": "", "dateKey": "2026-11-16"}
    code, data = request("POST", "/tasks", empty_task_payload)
    if code == 400 and data.get("error") == "VALIDATION_FAILED":
        record("API-TASK-01", "Tasks API", "Task creation validation rejection on empty title",
               "400 Bad Request with field error", f"400 Bad Request: {data.get('fieldErrors', {})}", "PASS")
    else:
        record("API-TASK-01", "Tasks API", "Task creation validation rejection on empty title",
               "400 Bad Request", f"Status {code}, data: {data}", "FAIL")

    # 8. POST /tasks (Validation: Title < 3 characters)
    short_task_payload = {"title": "ab", "dateKey": "2026-11-16"}
    code, data = request("POST", "/tasks", short_task_payload)
    if code == 400 and "title" in data.get("fieldErrors", {}):
        record("API-TASK-02", "Tasks API", "Task creation validation rejection on title < 3 characters",
               "400 Bad Request with title length constraint message",
               f"400 Bad Request: {data['fieldErrors']['title']}", "PASS")
    else:
        record("API-TASK-02", "Tasks API", "Task creation validation rejection on title < 3 characters",
               "400 Bad Request", f"Status {code}, data: {data}", "FAIL")

    # 9. POST /tasks (Valid Creation)
    task1_payload = {
        "title": "Build Automated E2E Suite",
        "description": "Integration verification for Cadence",
        "dateKey": "2026-11-16",
        "priority": "HIGH",
        "categoryId": custom_cat_id,
        "estimatedMinutes": 45,
        "tags": ["qa", "automation"]
    }
    code, data = request("POST", "/tasks", task1_payload)
    task1_id = None
    if code == 201 and data.get("id") and data.get("title") == "Build Automated E2E Suite":
        task1_id = data["id"]
        record("API-TASK-03", "Tasks API", "Create valid task with priority and tags in MongoDB Atlas",
               "201 Created with generated MongoDB ID and order >= 0",
               f"201 Created, ID={task1_id}, order={data.get('order')}", "PASS")
    else:
        record("API-TASK-03", "Tasks API", "Create valid task with priority and tags in MongoDB Atlas",
               "201 Created", f"Status {code}, data: {data}", "FAIL")

    # 10. POST /tasks (Second Task for Reordering & Carry-over)
    task2_payload = {
        "title": "Review Performance Benchmarks",
        "description": "Evaluate p95 response time",
        "dateKey": "2026-11-16",
        "priority": "MEDIUM",
        "estimatedMinutes": 30,
        "tags": ["benchmarking"]
    }
    code, data = request("POST", "/tasks", task2_payload)
    task2_id = data.get("id") if code == 201 else None

    # 11. GET /tasks with Date Range Filtering
    code, data = request("GET", "/tasks?startDate=2026-11-16&endDate=2026-11-22")
    if code == 200 and isinstance(data, list) and len(data) >= 2:
        task_ids = [t["id"] for t in data]
        if task1_id in task_ids and task2_id in task_ids:
            record("API-TASK-04", "Tasks API", "Query tasks with date range filtering (startDate, endDate)",
                   "200 OK with list of tasks scheduled in week range",
                   f"200 OK, {len(data)} tasks returned in range", "PASS")
        else:
            record("API-TASK-04", "Tasks API", "Query tasks with date range filtering",
                   "Contains created task IDs", f"Returned tasks: {task_ids}", "FAIL")
    else:
        record("API-TASK-04", "Tasks API", "Query tasks with date range filtering",
               "200 OK with array", f"Status {code}, data: {data}", "FAIL")

    # 12. PUT /tasks/{id} (Update Details and Toggle Status)
    if task1_id:
        update_payload = {
            "title": "Build Automated E2E Suite (Completed)",
            "status": "COMPLETED",
            "dateKey": "2026-11-16",
            "priority": "HIGH"
        }
        code, data = request("PUT", f"/tasks/{task1_id}", update_payload)
        if code == 200 and data.get("status") == "COMPLETED" and data.get("completedAt"):
            record("API-TASK-05", "Tasks API", "Task status transition to COMPLETED populates completedAt",
                   "200 OK with status COMPLETED and non-null completedAt timestamp",
                   f"200 OK, completedAt={data.get('completedAt')}", "PASS")
        else:
            record("API-TASK-05", "Tasks API", "Task status transition to COMPLETED",
                   "200 OK with completedAt", f"Status {code}, data: {data}", "FAIL")

    # 13. PATCH /tasks/reorder (Batch Drag-and-Drop Order Persistence)
    if task1_id and task2_id:
        reorder_payload = [
            {"id": task1_id, "dateKey": "2026-11-17", "order": 1},
            {"id": task2_id, "dateKey": "2026-11-17", "order": 0}
        ]
        code, data = request("PATCH", "/tasks/reorder", reorder_payload)
        if code == 200 and isinstance(data, list):
            # Verify in DB via GET
            code2, data2 = request("GET", "/tasks?startDate=2026-11-17&endDate=2026-11-17")
            day_tasks = {t["id"]: t for t in data2}
            if day_tasks.get(task2_id, {}).get("order") == 0 and day_tasks.get(task1_id, {}).get("order") == 1:
                record("API-TASK-06", "Tasks API", "Batch task reordering across days with order persistence",
                       "200 OK and tasks moved to 2026-11-17 with reordered indexes [0, 1]",
                       "200 OK, verified persisted in MongoDB Atlas", "PASS")
            else:
                record("API-TASK-06", "Tasks API", "Batch task reordering",
                       "Orders persisted as 0 and 1", f"Actual in DB: {day_tasks}", "FAIL")
        else:
            record("API-TASK-06", "Tasks API", "Batch task reordering",
                   "200 OK", f"Status {code}, data: {data}", "FAIL")

    # 14. POST /tasks/carry-over (Roll Over Incomplete Tasks & Duplicate Prevention)
    # task2 is TODO on 2026-11-17, task1 is COMPLETED on 2026-11-17.
    # Carrying over from 2026-11-16 to 2026-11-22 should ONLY carry over task2 to targetDate=2026-11-23.
    carry_payload = {
        "startDate": "2026-11-16",
        "endDate": "2026-11-22",
        "targetDate": "2026-11-23"
    }
    code, data = request("POST", "/tasks/carry-over", carry_payload)
    if code == 200 and isinstance(data, list):
        carried_ids = [t["id"] for t in data]
        if task2_id in carried_ids and task1_id not in carried_ids:
            # Test idempotence / duplicate prevention: click carry-over again
            code2, data2 = request("POST", "/tasks/carry-over", carry_payload)
            if code2 == 200 and (len(data2) == 0 or all(t["id"] != task2_id for t in data2)):
                record("API-TASK-07", "Tasks API", "Carry over incomplete tasks to next week with duplicate prevention",
                       "200 OK with only incomplete tasks moved, subsequent click produces 0 duplicates",
                       f"200 OK, initial carry: {carried_ids}, second run: {len(data2)} tasks", "PASS")
            else:
                record("API-TASK-07", "Tasks API", "Carry over incomplete tasks duplicate prevention",
                       "No duplicates on second run", f"Second run returned: {data2}", "FAIL")
        else:
            record("API-TASK-07", "Tasks API", "Carry over incomplete tasks",
                   f"Only task2 ({task2_id}) carried over, completed task1 omitted",
                   f"Carried: {carried_ids}", "FAIL")
    else:
        record("API-TASK-07", "Tasks API", "Carry over incomplete tasks",
               "200 OK", f"Status {code}, data: {data}", "FAIL")

    # 15. DELETE /categories/{id} (Safe Deletion & Task Reassignment)
    # We had task1 referencing custom_cat_id. Let's delete custom_cat_id.
    if custom_cat_id and task1_id:
        code, data = request("DELETE", f"/categories/{custom_cat_id}")
        if code == 204:
            # Check task1 categoryName in database
            code_t, task_after = request("GET", f"/tasks/{task1_id}")
            if code_t == 200 and task_after.get("category") == "Uncategorized":
                record("API-CAT-07", "Categories API", "Safe category deletion with graceful task reassignment to Uncategorized",
                       "204 No Content for deletion, linked task reassigned to Uncategorized",
                       "204 No Content, task.category='Uncategorized'", "PASS")
            else:
                record("API-CAT-07", "Categories API", "Safe category deletion task reassignment",
                       "task reassigned to Uncategorized", f"Task after delete: {task_after}", "FAIL")
        else:
            record("API-CAT-07", "Categories API", "Safe category deletion",
                   "204 No Content", f"Status {code}, data: {data}", "FAIL")

    # 16. DELETE /tasks/{id} (Task Deletion & 404 on Subsequent Lookup)
    if task1_id:
        code, data = request("DELETE", f"/tasks/{task1_id}")
        if code == 204:
            code_verify, _ = request("GET", f"/tasks/{task1_id}")
            if code_verify == 404:
                record("API-TASK-08", "Tasks API", "Delete task permanently from MongoDB Atlas",
                       "204 No Content on delete, subsequent GET returns 404 Not Found",
                       "204 No Content, verified 404 Not Found", "PASS")
            else:
                record("API-TASK-08", "Tasks API", "Delete task permanently",
                       "404 on subsequent GET", f"Status was {code_verify}", "FAIL")
        else:
            record("API-TASK-08", "Tasks API", "Delete task permanently",
                   "204 No Content", f"Status {code}", "FAIL")

    # Clean up task2
    if task2_id:
        request("DELETE", f"/tasks/{task2_id}")

    # Output summary
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = total - passed
    rate = (passed / total) * 100 if total > 0 else 0
    print("\n" + "=" * 60)
    print(f"TEST EXECUTION SUMMARY: Total={total}, Passed={passed}, Failed={failed}, Rate={rate:.1f}%")
    print("=" * 60)
    
    with open("qa_results_backend.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    run_tests()
