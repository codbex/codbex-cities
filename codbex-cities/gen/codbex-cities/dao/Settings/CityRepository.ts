import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CityEntity {
    readonly Id: number;
    Name: string;
    Country: number;
}

export interface CityCreateEntity {
    readonly Name: string;
    readonly Country: number;
}

export interface CityUpdateEntity extends CityCreateEntity {
    readonly Id: number;
}

export interface CityEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Country?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Country?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Country?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Country?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Country?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Country?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Country?: number;
        };
    },
    $select?: (keyof CityEntity)[],
    $sort?: string | (keyof CityEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface CityEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CityEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface CityUpdateEntityEvent extends CityEntityEvent {
    readonly previousEntity: CityEntity;
}

export class CityRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CITY",
        properties: [
            {
                name: "Id",
                column: "CITY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CITY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Country",
                column: "CITY_COUNTRY",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CityRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: CityEntityOptions = {}): CityEntity[] {
        let list = this.dao.list(options);
        try {
            let script = sql.getDialect().select().column("*").from('"' + CityRepository.DEFINITION.table + '_LANG"').where('Language = ?').build();
            const resultSet = query.execute(script, [options.$language]);
            if (resultSet !== null && resultSet[0] !== null) {
                let translatedProperties = Object.getOwnPropertyNames(resultSet[0]);
                let maps = [];
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    maps[i] = {};
                }
                resultSet.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        maps[i][r[translatedProperties[0]]] = r[translatedProperties[i + 1]];
                    }
                });
                list.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        if (maps[i][r[translatedProperties[0]]]) {
                            r[translatedProperties[i + 1]] = maps[i][r[translatedProperties[0]]];
                        }
                    }

                });
            }
        } catch (Error) {
            console.error("Entity is marked as language dependent, but no language table present: " + CityRepository.DEFINITION.table);
        }
        return list;
    }

    public findById(id: number, options: CityEntityOptions = {}): CityEntity | undefined {
        const entity = this.dao.find(id);
        if (entity) {
            try {
                let script = sql.getDialect().select().column("*").from('"' + CityRepository.DEFINITION.table + '_LANG"').where('Language = ?').where('Id = ?').build();
                const resultSet = query.execute(script, [options.$language, id]);
                let translatedProperties = Object.getOwnPropertyNames(resultSet[0]);
                let maps = [];
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    maps[i] = {};
                }
                resultSet.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        maps[i][r[translatedProperties[0]]] = r[translatedProperties[i + 1]];
                    }
                });
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    if (maps[i][entity[translatedProperties[0]]]) {
                        entity[translatedProperties[i + 1]] = maps[i][entity[translatedProperties[0]]];
                    }
                }
            } catch (Error) {
                console.error("Entity is marked as language dependent, but no language table present: " + CityRepository.DEFINITION.table);
            }
        }
        return entity ?? undefined;
    }

    public create(entity: CityCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CITY",
            entity: entity,
            key: {
                name: "Id",
                column: "CITY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CityUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CITY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CITY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CityCreateEntity | CityUpdateEntity): number {
        const id = (entity as CityUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CityUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_CITY",
            entity: entity,
            key: {
                name: "Id",
                column: "CITY_ID",
                value: id
            }
        });
    }

    public count(options?: CityEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CITY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CityEntityEvent | CityUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-cities-Settings-City", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-cities-Settings-City").send(JSON.stringify(data));
    }
}
