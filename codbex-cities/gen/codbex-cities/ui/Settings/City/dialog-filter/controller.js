angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, $http, ViewParameters, LocaleService) => {
	const Dialogs = new DialogHub();
	let description = 'Description';
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	LocaleService.onInit(() => {
		description = LocaleService.t('codbex-cities:codbex-cities-model.defaults.description');
	});

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		const optionsCountryMap = new Map();
		params.optionsCountry.forEach(e => optionsCountryMap.set(e.value, e));
		$scope.optionsCountry = Array.from(optionsCountryMap.values());
	}

	$scope.filter = () => {
		let entity = $scope.entity;
		const filter = {
			$filter: {
				conditions: [],
				sorts: [],
				limit: 20,
				offset: 0
			}
		};
		if (entity.Id !== undefined) {
			const condition = { propertyName: 'Id', operator: 'EQ', value: entity.Id };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Name) {
			const condition = { propertyName: 'Name', operator: 'LIKE', value: `%${entity.Name}%` };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Country !== undefined) {
			const condition = { propertyName: 'Country', operator: 'EQ', value: entity.Country };
			filter.$filter.conditions.push(condition);
		}
		Dialogs.postMessage({ topic: 'codbex-cities.Settings.City.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
		lastSearchValuesCountry.clear()
		allValuesCountry.length = 0;
	};

	$scope.alert = (message) => {
		if (message) Dialogs.showAlert({
			title: description,
			message: message,
			type: AlertTypes.Information,
			preformatted: true,
		});
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'City-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};

	const lastSearchValuesCountry = new Set();
	const allValuesCountry = [];
	let loadMoreOptionsCountryCounter = 0;
	$scope.optionsCountryLoading = false;
	$scope.optionsCountryHasMore = true;

	$scope.loadMoreOptionsCountry = () => {
		const limit = 20;
		$scope.optionsCountryLoading = true;
		$http.get(`/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryController.ts?$limit=${limit}&$offset=${++loadMoreOptionsCountryCounter * limit}`)
		.then((response) => {
			const optionValues = allValuesCountry.map(e => e.value);
			const resultValues = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
			const newValues = [];
			resultValues.forEach(e => {
				if (!optionValues.includes(e.value)) {
					allValuesCountry.push(e);
					newValues.push(e);
				}
			});
			newValues.forEach(e => {
				if (!$scope.optionsCountry.find(o => o.value === e.value)) {
					$scope.optionsCountry.push(e);
				}
			})
			$scope.optionsCountryHasMore = resultValues.length > 0;
			$scope.optionsCountryLoading = false;
		}, (error) => {
			$scope.optionsCountryLoading = false;
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Country',
				message: LocaleService.t('codbex-cities:codbex-cities-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});
	};

	$scope.onOptionsCountryChange = (event) => {
		if (allValuesCountry.length === 0) {
			allValuesCountry.push(...$scope.optionsCountry);
		}
		if (event.originalEvent.target.value === '') {
			allValuesCountry.sort((a, b) => a.text.localeCompare(b.text));
			$scope.optionsCountry = allValuesCountry;
			$scope.optionsCountryHasMore = true;
		} else if (isText(event.which)) {
			$scope.optionsCountryHasMore = false;
			let cacheHit = false;
			Array.from(lastSearchValuesCountry).forEach(e => {
				if (event.originalEvent.target.value.startsWith(e)) {
					cacheHit = true;
				}
			})
			if (!cacheHit) {
				$http.post('/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryController.ts/search', {
					conditions: [
						{ propertyName: 'Name', operator: 'LIKE', value: `${event.originalEvent.target.value}%` }
					]
				}).then((response) => {
					const optionValues = allValuesCountry.map(e => e.value);
					const searchResult = response.data.map(e => ({
						value: e.Id,
						text: e.Name
					}));
					searchResult.forEach(e => {
						if (!optionValues.includes(e.value)) {
							allValuesCountry.push(e);
						}
					});
					$scope.optionsCountry = allValuesCountry.filter(e => e.text.toLowerCase().startsWith(event.originalEvent.target.value.toLowerCase()));
				}, (error) => {
					console.error(error);
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: 'Country',
						message: LocaleService.t('codbex-cities:codbex-cities-model.messages.error.unableToLoad', { message: message }),
						type: AlertTypes.Error
					});
				});
				lastSearchValuesCountry.add(event.originalEvent.target.value);
			}
		}
	};

	function isText(keycode) {
		if ((keycode >= 48 && keycode <= 90) || (keycode >= 96 && keycode <= 111) || (keycode >= 186 && keycode <= 222) || [8, 46, 173].includes(keycode)) return true;
		return false;
	}

});