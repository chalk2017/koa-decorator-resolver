import { defineDatabase } from './baseDefined';
import { OrmLoader } from './sequelize.loader';

export const OrmBinder = (tablesStructure, relation, option) => {
    const database = new defineDatabase(OrmLoader, {
        tablesStructure,
        relation,
        ...option
    });
    return {
        connect: database.connect,
        Database: database.database,
    }
}
