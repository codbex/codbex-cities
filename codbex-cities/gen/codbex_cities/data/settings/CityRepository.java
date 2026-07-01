package gen.codbex_cities.data.settings;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.sdk.component.Repository;
import org.eclipse.dirigible.sdk.messaging.Producer;
import org.eclipse.dirigible.sdk.utils.Json;

@Repository
public class CityRepository extends JavaRepository<CityEntity> {

    public CityRepository() {
        super(CityEntity.class);
    }

    @Override
    public CityEntity save(CityEntity entity) {
        CityEntity saved = super.save(entity);
        // Publish the create event so listeners (e.g. intent process triggers / reactions under gen/events) can react.
        Producer.sendToTopic("codbex-cities-Settings-City", Json.stringify(saved));
        return saved;
    }

    @Override
    public CityEntity update(CityEntity entity) {
        CityEntity updated = super.update(entity);
        // Publish the update event (suffixed topic) so intent reactions under gen/events can react.
        Producer.sendToTopic("codbex-cities-Settings-City-updated", Json.stringify(updated));
        return updated;
    }

    /**
     * Persists changes WITHOUT publishing the "-updated" event. Intended for system-managed
     * back-references — e.g. an intent process trigger writing ProcessId back onto the entity that
     * started it. Going through {@link #update} would re-publish "City-updated" and spuriously
     * re-fire onUpdate reactions (notifications, roll-ups, integrations) for a change the user never made.
     */
    public CityEntity updateWithoutEvent(CityEntity entity) {
        return super.update(entity);
    }

    @Override
    public void delete(CityEntity entity) {
        super.delete(entity);
        // Publish the delete event (suffixed topic) so intent reactions under gen/events can react.
        Producer.sendToTopic("codbex-cities-Settings-City-deleted", Json.stringify(entity));
    }

    @Override
    public void deleteById(Object id) {
        CityEntity entity = findById(id);
        super.deleteById(id);
        if (entity != null) {
            Producer.sendToTopic("codbex-cities-Settings-City-deleted", Json.stringify(entity));
        }
    }
}
