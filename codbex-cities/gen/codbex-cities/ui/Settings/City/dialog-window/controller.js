angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-cities/gen/codbex-cities/api/Settings/CityController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'City successfully created';
		let propertySuccessfullyUpdated = 'City successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'City Details',
			create: 'Create City',
			update: 'Update City'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-cities:codbex-cities-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-cities:codbex-cities-model.defaults.formHeadSelect', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-cities:codbex-cities-model.defaults.formHeadCreate', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-cities:codbex-cities-model.defaults.formHeadUpdate', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-cities:codbex-cities-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-cities:codbex-cities-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			const optionsCountryMap = new Map();
			params.optionsCountry?.forEach(e => optionsCountryMap.set(e.value, e));
			$scope.optionsCountry = Array.from(optionsCountryMap.values());
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-cities.Settings.City.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-cities:codbex-cities-model.t.CITY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-cities:codbex-cities-model.messages.error.unableToCreate', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-cities.Settings.City.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-cities:codbex-cities-model.t.CITY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-cities:codbex-cities-model.messages.error.unableToUpdate', { name: '$t(codbex-cities:codbex-cities-model.t.CITY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceCountry = '/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryController.ts';
		
		$scope.optionsCountry = [];
		
		$http.get('/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryController.ts').then((response) => {
			$scope.optionsCountry = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Country',
				message: LocaleService.t('codbex-cities:codbex-cities-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

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

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'City-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});