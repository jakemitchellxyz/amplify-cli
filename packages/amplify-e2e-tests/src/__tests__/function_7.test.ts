import {
  addFunction,
  amplifyPushAuth,
  createNewProjectDir,
  deleteProject,
  deleteProjectDir,
  getProjectMeta,
  initJSProjectWithProfile,
  invokeFunction,
  overrideFunctionCodeNode,
} from 'amplify-e2e-core';

describe('function secret value', () => {
  let projRoot: string;

  beforeEach(async () => {
    projRoot = await createNewProjectDir('funcsecrets');
  });

  afterEach(async () => {
    await deleteProject(projRoot);
    deleteProjectDir(projRoot);
  });

  it('configures secret that is accessible in the cloud', async () => {
    await initJSProjectWithProfile(projRoot, { disableAmplifyAppCreation: false });
    const random = Math.floor(Math.random() * 10000);
    const funcName = `secretsTest${random}`;
    await addFunction(
      projRoot,
      {
        functionTemplate: 'Hello World',
        name: funcName,
        secretsConfig: {
          name: 'TEST_SECRET',
          value: 'testsecretvalue',
        },
      },
      'nodejs',
    );
    overrideFunctionCodeNode(projRoot, funcName, 'retrieve-secret.js');
    await amplifyPushAuth(projRoot);

    const lambdaEvent = {
      secretNames: ['TEST_SECRET'],
    };

    const meta = getProjectMeta(projRoot);
    const { Region: region } = (Object.values(meta.function)[0] as any).output;

    const response = await invokeFunction(`${funcName}-integtest`, JSON.stringify(lambdaEvent), region);
    expect(JSON.parse(response.Payload.toString())[0]?.Value).toEqual('testsecretvalue');
  });

  it('removes secrets immediately when func not pushed', async () => {
    // add func w/ secret
    // remove secret
    // check that ssm param doesn't exist
  });

  it('removes secrets immediately when unpushed function is removed from project', async () => {
    // add func w/ secret
    // remove func
    // check that ssm param doesn't exist
  });

  it('removes secrets on push when func is already pushed', async () => {
    // add func w/ secret
    // push
    // remove secret
    // check that ssm param still exists
    // push
    // check that ssm param doesn't exist
  });

  it('removes secrets on push when pushed function is removed', async () => {
    // add func w/ secret
    // push
    // remove func
    // check that ssm param still exists
    // push
    // check that ssm param doesn't exist
  });

  it('removes all secrets from env when env is removed', async () => {
    // add func w/ secret
    // checkout new env
    // remove orig env
    // check that ssm param doesn't exist
  });

  it('prompts for missing secrets and removes unused secrets on push', async () => {
    // add func w/ secret
    // replace contents of function-parameters.json with a different secret name
    // push -> should prompt for value for new secret
    // unused secret should be removed in cloud
  });

  it('copies secrets on env add', async () => {
    // add func w/ secret
    // env add --yes
    // check that secret exists in new env
  });
});
