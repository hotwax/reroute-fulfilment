export default interface UserState {
    token: string;
    current: object | null;
    instanceUrl: string;
    deliveryMethod: string;
    permissions: any;
    isSplitEnabled: boolean;
    isCancellationAllowed: boolean;
}