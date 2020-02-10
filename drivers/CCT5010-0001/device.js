'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');

class CCT5010_001 extends ZigBeeDevice {

	onMeshInit() {

		// Developer tools
//		this.enableDebug();
		this.printNode();

		// Register capabilities and listeners
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });

			this.registerAttrReportListener('genOnOff', 'onOff', 1, 60, 1, data => {
				if (this.getCapabilityValue('onoff') !== (data === 1)) {

					this.log('genOnOff - onOff', data);
					this.setCapabilityValue('onoff', data === 1);

				}
				
			}, 0)
			.catch(err => {
				this.error()
			});

			this._attrReportListeners['2_genOnOff'] = this._attrReportListeners['2_genOnOff'] || {};
			this._attrReportListeners['2_genOnOff']['onOff'] = this.onOffReport.bind(this);

		};
		
		if (this.hasCapability('dim')) {
			this.registerCapability('dim', 'genLevelCtrl', { endpoint: 0 });

			this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 3, 60, 3, data => {
				if (this.getCapabilityValue('dim') !== (data === 1)) {
					this.log('genLevelCtrl - currentLevel', data);
					this.setCapabilityValue('dim', data / 254);
					this.log('Dim level, genLevelCtrl', data, data / 254);
					}

			}, 0)
			.catch(err => {
				this.error()
			});

			this._attrReportListeners['2_genLevelCtrl'] = this._attrReportListeners['2_genLevelCtrl'] || {};
			this._attrReportListeners['2_genLevelCtrl']['currentLevel'] = this.dimLevelReport.bind(this);

		};

		// end Register capabilities and listeners

		this.log('Micro Module Dimmer Driver has been inited');

	}

	// Handle reports
	onOffReport(value) {
		const settings = this.getSettings();
		const parsedValue = (value === 1);
		this.log('OnOff Status, genOnOff', value, parsedValue);
		if ( settings.retain_dim_level == true ) {
			this.node.endpoints[0].clusters['genLevelCtrl'].read("currentLevel")
			.then(level => {
				this.node.endpoints[0].clusters['genLevelCtrl'].write("onLevel", level)
				.catch(err => {
					this.error()
				});
			});
		} else {
			this.node.endpoints[0].clusters['genLevelCtrl'].write("onLevel", 254)
			.catch(err => {
				this.error()
			});
		};
		this.setCapabilityValue('onoff', parsedValue);
	}

	dimLevelReport(value) {
		const parsedValue = value / 254;
		this.log('Dim level, genLevelCtrl', value, parsedValue);
		this.setCapabilityValue('dim', parsedValue);

	} // end Handle reports

}

module.exports = CCT5010_001;