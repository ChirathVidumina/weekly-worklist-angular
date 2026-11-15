package com.vidumina.worklist.constant;

public final class ApiConstants {

    private ApiConstants() {
        // Prevent instantiation
    }

    public static final String API_V1_PREFIX = "/api/v1";
    public static final String TASKS_PATH = API_V1_PREFIX + "/tasks";
    public static final String CATEGORIES_PATH = API_V1_PREFIX + "/categories";

    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_PATTERN_REGEX = "^\\d{4}-\\d{2}-\\d{2}$";

    public static final String ERROR_CODE_VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String ERROR_CODE_RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
    public static final String ERROR_CODE_DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE";
    public static final String ERROR_CODE_MALFORMED_JSON = "MALFORMED_JSON";
    public static final String ERROR_CODE_INTERNAL_ERROR = "INTERNAL_SERVER_ERROR";
}
