# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore NuGet dependencies
COPY ["WeeklyWorklist.Api.csproj", "./"]
RUN dotnet restore "WeeklyWorklist.Api.csproj"

# Copy full source and publish Release artifact
COPY . .
RUN dotnet publish "WeeklyWorklist.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal & Secure ASP.NET Core 8 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app

# Non-root user for container security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/publish .

# Cloud deployment default port (Render automatically provides $PORT)
ENV PORT=8080
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
EXPOSE 8080

ENTRYPOINT ["dotnet", "WeeklyWorklist.Api.dll"]
