class RouterConfig {
    home = '/';
    login = '/login';
    // registration = '/registration';
    // forgotPassword = '/forgot-password';
    // createCompany = '/create-company';
    // schedule = '/schedule';
    // addAppointment = '/add-appointment';
    // tasks = '/tasks';
    // clients = '/clients';
    // employees = '/employees';
    // market = '/market';
    // counterparties = 'counterparties';
    // notes = '/notes';
    // analitycs = '/analitycs';
    // accounts = '/accounts';
    dashboard = '/dashboard';
    fileView = '/file/:fileName';
    fileEdit = '/edit/:fileName';
    examples = '/examples';
    storage = '/storage';
    folderView = '/folder/*';
}

export const routerConfig = new RouterConfig();
