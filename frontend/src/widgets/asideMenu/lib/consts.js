// import Calendar from 'shared/assets/icons/calendar.svg?react';
// import Tasks from 'shared/assets/icons/tasks.svg?react';
// import Employees from 'shared/assets/icons/employees.svg?react';
// import Market from 'shared/assets/icons/market.svg?react';
// import Analitycs from 'shared/assets/icons/analytics.svg?react';
// import Clients from 'shared/assets/icons/clients.svg?react';
// import Notes from 'shared/assets/icons/notes.svg?react';
// import Settings from 'shared/assets/icons/settings.svg?react';
// import Exit from 'shared/assets/icons/exit.svg?react';

import { ReactComponent as MainIcon } from '../assets/main.svg';
import { ReactComponent as DashboardIcon } from '../assets/dashboard.svg';
import { ReactComponent as ExamplesIcon } from '../assets/examples.svg';
import { ReactComponent as StoragesIcon } from '../assets/storages.svg';

export const menuItemList = [
    {
        title: 'Главная',
        icon: MainIcon,
        isActive: false,
        url: ''
    },
    {
        title: 'Библиотека',
        icon: DashboardIcon,
        isActive: false,
        url: 'dashboard'
    },
    {
        title: 'Примеры',
        icon: ExamplesIcon,
        isActive: false,
        url: 'examples'
    },
    {
        title: 'Хранилище',
        icon: StoragesIcon,
        isActive: false,
        url: 'storage'
    },
    // {
    //     title: 'Клиенты',
    //     // icon: Clients,
    //     isActive: false,
    //     url: 'clients'
    // },
    // {
    //     title: 'Сотрудники',
    //     // icon: Employees,
    //     isActive: false,
    //     url: 'employees'
    // },
    // {
    //     title: 'Кассы',
    //     // icon: Market,
    //     isActive: false,
    //     url: 'market'
    // },
    // {
    //     title: 'Файлы',
    //     // icon: Notes,
    //     isActive: false,
    //     url: 'notes'
    // },
    // {
    //     title: 'Статистика',
    //     // icon: Analitycs,
    //     isActive: false,
    //     url: 'analitycs'
    // },
    // {
    //     title: 'Настройки',
    //     // icon: Settings,
    //     isActive: false,
    //     url: 'settigs'
    // },
    // {
    //     title: 'Выйти',
    //     // icon: Exit,
    //     isActive: false,
    //     url: ''
    // },
]
