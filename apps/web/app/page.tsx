import { env } from '@clove/env/web';

export default function () {
    return (
        <div className="h-screen flex items-center justify-center">
            Web is running in {env.NODE_ENV} mode
        </div>
    );
}
