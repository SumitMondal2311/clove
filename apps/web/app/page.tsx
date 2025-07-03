import { sharedEnv } from '@clove/env/shared';

export default function () {
    return (
        <div className="h-screen flex items-center justify-center">
            Web is running in {sharedEnv.NODE_ENV} mode
        </div>
    );
}
