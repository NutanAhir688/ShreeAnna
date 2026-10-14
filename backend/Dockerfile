# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY backend.csproj ./
RUN dotnet restore

# Copy all source files and build/publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

EXPOSE 5066
ENV ASPNETCORE_URLS=http://0.0.0.0:5066

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "backend.dll"]
