import React from 'react'
import {
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom'
import { Dashboard } from '../../pages/dashboard/Dashboard'
import { Welcome } from '../../pages/welcome'
import { routerConfig } from '../../shared/consts/routerConfig'
import { DefaultLayout } from '../layout'
import { FileView } from '../../pages/fileView/FileView'
import { EditView } from '../../pages/fileView/EditView'
import { ChartExamples } from '../../pages/chart-examples/ChartExamples'
import { Storage } from '../../pages/storage'
import FolderView from '../../pages/folderView/FolderView'

export const AppRouter = () => {

    return (
            <Router>
                <Routes>
                    <Route path={routerConfig.home} element={<DefaultLayout />}>
                        <Route path={routerConfig.home} element={<Welcome />} />
                        <Route path={routerConfig.dashboard} element={<Dashboard />} />
                        <Route path={routerConfig.fileView} element={<FileView />} />
                        <Route path={routerConfig.fileEdit} element={<EditView />} />
                        <Route path={routerConfig.examples} element={<ChartExamples />} />
                        <Route path={routerConfig.storage} element={<Storage />} />
                        <Route path={routerConfig.folderView} element={<FolderView />} />
                    </Route>
                </Routes>
            </Router>
    );
}
