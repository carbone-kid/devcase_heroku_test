// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  backendUrl: 'http://localhost:8080/api',
  //backendUrl: 'https://sytac-dev-case.herokuapp.com/api',
  // backendUrl: 'http://192.168.1.228:8080/api',
  // backendUrl: 'https://private-4666c3-fakeapiforwork.apiary-mock.com',
  // backendUrl: '//private-4666c3-fakeapiforwork.apiary-mock.com/devcase'
};
