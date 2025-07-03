import { config } from '@clove/eslint-config/utility';
export default [...config, { ignores: ['node_modules', 'dist', 'generated'] }];
