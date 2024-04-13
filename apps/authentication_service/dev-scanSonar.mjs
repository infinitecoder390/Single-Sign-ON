import scanner from 'sonarqube-scanner';

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL ?? 'http://localhost:9000',
    token: process.env.SONAR_AUTH_TOKEN ?? '',
    options: {
      'sonar.projectName': 'TCG SSO Authentication Dev',
      'sonar.projectDescription': 'NestJS Code',
      'sonar.projectKey': process.env.SONAR_PROJECT_KEY ?? 'TCG-SSO-Authentication-Dev',
      'sonar.projectVersion': '0.0.1',
      'sonar.exclusions': '**/node_modules/**, **/*.repo.tsx, **/*.module.tsx, **/*.stories.tsx',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  () => process.exit()
);
