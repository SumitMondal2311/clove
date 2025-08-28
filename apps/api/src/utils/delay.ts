export const delay = (timeout: number): Promise<any> => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};
