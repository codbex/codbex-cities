angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-cities/gen/codbex-cities/api/Settings/CityService.ts';
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
			$scope.optionsCountry = params.optionsCountry;
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

		$scope.serviceCountry = '/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryService.ts';
		
		$scope.optionsCountry = [];
		
		$http.get('/services/ts/codbex-countries/gen/codbex-countries/api/Settings/CountryService.ts').then((response) => {
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