import { chooseServiceMessageAdd } from '../../provider-utils/awscloudformation/utils/constants';
import { category } from '../../constants';
import { supportedServices } from '../../provider-utils/supportedServices';

const subcommand = 'add';

let options;

module.exports = {
  name: subcommand,
  run: async (context: any) => {
    const { amplify } = context;
    const servicesMetadata = supportedServices;
    return amplify
      .serviceSelectionPrompt(context, category, servicesMetadata, chooseServiceMessageAdd)
      .then((result: {service: string, providerName: string}) => {
        options = {
          service: result.service,
          providerPlugin: result.providerName,
          build: true,
        };
        const providerController = servicesMetadata[result.service].providerController;
        if (!providerController) {
          context.print.error('Provider not configured for this category');
          return;
        }
        return providerController.addResource(context, result.service, options);
      })
      .then(() => {
        context.print.info('');
      })
      .catch((err: any) => {
        context.print.info(err.stack);
        context.print.error('There was an error adding the geo resource');
        context.usageData.emitError(err);
        process.exitCode = 1;
      });
  },
};