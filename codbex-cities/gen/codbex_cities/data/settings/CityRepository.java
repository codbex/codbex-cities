package gen.codbex_cities.data.settings;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.engine.java.annotations.Repository;

@Repository
public class CityRepository extends JavaRepository<CityEntity> {

    public CityRepository() {
        super(CityEntity.class);
    }
}
