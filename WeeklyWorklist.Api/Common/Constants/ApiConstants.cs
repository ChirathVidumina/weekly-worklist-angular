namespace WeeklyWorklist.Api.Common.Constants;

public static class ApiConstants
{
    public const string ApiV1Prefix = "api/v1";
    public const string TasksRoute = "api/v1/tasks";
    public const string CategoriesRoute = "api/v1/categories";

    public const string TasksCollection = "tasks";
    public const string CategoriesCollection = "categories";

    public const string ErrorCodeValidationFailed = "VALIDATION_FAILED";
    public const string ErrorCodeResourceNotFound = "RESOURCE_NOT_FOUND";
    public const string ErrorCodeDuplicateResource = "DUPLICATE_RESOURCE";
    public const string ErrorCodeInternalError = "INTERNAL_SERVER_ERROR";
}
