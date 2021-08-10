/* jshint browser: true, esversion: 5, asi: true */
/*globals Vue, uibuilder */
// @ts-nocheck
/*
	Copyright (c) 2021 Julian Knight (Totally Information)

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
'use strict'

/** @see https://totallyinformation.github.io/node-red-contrib-uibuilder/#/front-end-library */

// eslint-disable-next-line no-unused-vars
const app = new Vue({
	el: '#app',

	data() { return {

		startMsg    : 'Vue has started, waiting for messages',
		module      : 'discovery',
		feVersion   : '',
		counterBtn  : 0,
		language    : [{text:'English', value:'English'},
				{text:'Malay', value:'Malay'},
				{text:'Others', value:'Others'}],
		lang        : [],
		docTable    : null,

		docList     : null,
		docData     : [],
		docCol      : [],

		flowTable   : null,

		flowData    : [],
		flowCol     : [],

		flow_name   : null,
		flow_desc   : null,

		jLogicList  : [],
		jFlowList   : [],
		toastCount  : 0,

		dfTabs      : null,
		dfList      : [
					{
						'title':'Tasks', 'name':null, 'desc':null, 'table':'task-table', 
						'placeholder':['Task Name','Task Description'],
						'dfData':[], 'dfCol':[], 'dfTable': null, 'field':'task'}, 
					{
						'title':'Flows', 'name':null, 'desc':null, 'table':'flow-table', 
						'placeholder':['Flow Name','Flow Description'],
						'dfData':[], 'dfCol':[], 'dfTable': null, 'field':'flow'}
				],
		dfMenu      : [{'title':'Task','active':true, 'module':'Home', 'field':'flow'},
				{'title':'Flow','active':false, 'module':'Flow', 'field':'jsonlogic'}],

		toolpanel   : null,
		toolpanelref: [],

		doc         : null,
		filename    : null,
		inputText   : null,
		inputChkBox : false,
		socketConnectedState : false,
		serverTimeOffset     : '[unknown]',
		imgProps    : { width: 75, height: 75 },

		msgRecvd    : '[Nothing]',
		msgsReceived: 0,
		msgCtrl     : '[Nothing]',
		msgsControl : 0,

		msgSent     : '[Nothing]',
		msgsSent    : 0,
		msgCtrlSent : '[Nothing]',
		msgsCtrlSent: 0,

		isLoggedOn  : false,
		userId      : null,
		userPw      : null,
		inputId     : '',
		menu        : [],
		editor      : null,
		mobile_item_selec: '',
		mobile_last_move: null,
		vis_tok     : null

	}}, // --- End of data --- //

	computed: {

		doVisTok: function() {
			return this.vis_tok;
		}

	}, // --- End of computed --- //

	methods: {

		makeToast: function(mesg, append = true) {
			app.toastCount++
			app.$bvToast.toast(mesg, {
				title: 'Notification',
				toaster: 'b-toaster-top-center',
				variant: 'success',
				autoHideDelay: 5000,
				appendToast: append
			});
		},

		doServerReq: function(payload) {
			uibuilder.send( {
				'topic': payload.instruction,
				'module': this.module,
				'payload': payload
			});
		},

		doReadDicList: function() {
			// console.log('Button Pressed. Event Data: ', event)
			// console.log(payload)
			var payload = {
				'instruction': 'getDictionary',
				'language': this.lang
			}
			app.doServerReq(payload);
		},

		changeModule: function(event, item) {
			// console.log("changeModule: "+event.type);
			for (var idx in app.dfMenu) {
				if (app.dfMenu[idx].title == item.title) {
					app.dfMenu[idx].active = true;
					app.editor.changeModule(item.module);
					switch (event.type) {
						case 'click':
							app.toolpanel = parseInt(idx);
							app.dfTabs = parseInt(idx);
							break;
						case 'toolpanel':
							app.dfTabs = parseInt(idx);
							break;
						case 'dfTabs':
							app.toolpanel = parseInt(idx);
							break;
						case 'record':
							app.toolpanel = parseInt(idx);
							app.dfTabs = parseInt(idx);
							break;
					}
				} else {
					app.dfMenu[idx].active = false;
				}
			}
		},

		// return formatted HTML version of JSON object
		syntaxHighlight: function(json) {
			json = JSON.stringify(json, undefined, 4)
			json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
				var cls = 'number'
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'key'
					} else {
						cls = 'string'
					}
				} else if (/true|false/.test(match)) {
					cls = 'boolean'
				} else if (/null/.test(match)) {
					cls = 'null'
				}
				return '<span class="' + cls + '">' + match + '</span>'
			})
			return json
		}, // --- End of syntaxHighlight --- //

		positionMobile: function(ev) {
			//app.touch = app.touch + '[positionMobile]->' + ev.type;
			app.mobile_last_move = ev;
		},

		allowDrop: function(ev) {
			//app.touch = app.touch + '->' + ev.type;
			ev.preventDefault();
		},

		drag: function(ev, item) {
			//app.touch = app.touch + '[drag]->' + ev.type;
			if (ev.type === "touchstart") {
				//app.mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
				app.mobile_item_selec = item;
			} else {
				ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
			}
		},

		dragend: function(ev, item) {
			//app.touch = app.touch + '[dragend]->' + ev.type;
		},

		drop: function(ev) {
			//app.touch = app.touch + '[drop]->' + ev.type;
			if (ev.type === "touchend") {
				/*
				app.touch = app.touch + "xxx" + app.mobile_last_move.touches[0].clientX;
				var parentdrawflow = document.elementFromPoint( app.mobile_last_move.touches[0].clientX, app.mobile_last_move.touches[0].clientY).closest("#drawflow");
				app.touch = app.touch + parentdrawflow.text;
				if(parentdrawflow != null) {
					app.addNodeToDrawFlow(app.mobile_item_selec, app.mobile_last_move.touches[0].clientX, app.mobile_last_move.touches[0].clientY);
				}*/
				//app.touch = app.touch + "xxx" + app.mobile_item_selec.name
				if (app.mobile_last_move != null) {
					app.addNodeToDrawFlow(app.mobile_item_selec, app.mobile_last_move.touches[0].clientX, app.mobile_last_move.touches[0].clientY);
				}
				app.mobile_item_selec = '';
				app.mobile_last_move = null;
			} else {
				console.log("non touchend");
				ev.preventDefault();
				var data = JSON.parse(ev.dataTransfer.getData("node"));
				console.log(JSON.stringify(data));
				app.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
			}
		},

		genHTML: function(data) {
			var result = null;
			if ('jsonlogic' in data) {
				var html = '<div>';
				var key = Object.keys(data.jsonlogic)[0];
				var input = data.jsonlogic[key];
				html = html + data.name;
				for (var idx=0; idx<input.length - 1; idx++) {
					html =  html + '<input type="text" placeholder="'+ input[idx] +'" class="form-control" style="display: flex;"></input>';
				}
				html = html + '</div>';
				result = html;
			} else result = data.name;
			return result;
		},

		addNodeToDrawFlow: function(data, pos_x, pos_y) {
			if(app.editor.editor_mode === 'fixed') {
				return false;
			}
			pos_x = pos_x * ( app.editor.precanvas.clientWidth / (app.editor.precanvas.clientWidth * app.editor.zoom)) - (app.editor.precanvas.getBoundingClientRect().x * ( app.editor.precanvas.clientWidth / (app.editor.precanvas.clientWidth * app.editor.zoom)));
			pos_y = pos_y * ( app.editor.precanvas.clientHeight / (app.editor.precanvas.clientHeight * app.editor.zoom)) - (app.editor.precanvas.getBoundingClientRect().y * ( app.editor.precanvas.clientHeight / (app.editor.precanvas.clientHeight * app.editor.zoom)));

			console.log(data);
			app.editor.addNode(data.id, 1,	1, pos_x, pos_y, "flow-box", data[app.dfMenu[app.toolpanel].field], data.name);
			//app.editor.addNode(data.id, 1,	1, pos_x, pos_y, "flow-box", data[app.dfMenu[app.toolpanel].field], app.genHTML(data));
		},

		save: function(ev) {
			var curData = app.editor.export();
			var tableName = app.dfList[app.dfTabs].field;
			for (var key in curData.drawflow) {
				if (key != app.dfMenu[app.dfTabs].module) {
					delete curData.drawflow[key];
				}
			}
			var payload = {
				'instruction': 'save' + tableName[0].toUpperCase() + tableName.substring(1),
				'df': curData,
				'name': app.dfList[app.dfTabs].name,
				'desc': app.dfList[app.dfTabs].desc
			};
			app.doServerReq(payload);
		},

		applyTask: function(ev) {
			var curData = app.editor.export();
			var documents = app.docTable.getData();
			for (var key in curData.drawflow) {
				if (key != app.dfMenu[0].module) {
					delete curData.drawflow[key];
				}
			}
			var payload = {
				'instruction': 'applyTask',
				'df': curData,
				'documents': documents
			}
			app.doServerReq(payload);
		}

	}, // --- End of methods --- //

	// Available hooks: beforeCreate,created,beforeMount,mounted,beforeUpdate,updated,beforeDestroy,destroyed, activated,deactivated, errorCaptured
	watch: {
		toolpanel: {
			handler(val, oldVal) {
				// console.log("toolpanel:"+typeof(val)+" "+val);
				if (val>=0) {
					var event = {'type':'toolpanel'}
					app.changeModule(event, app.dfMenu[val]);
				}
			}
		},
		dfTabs: {
			handler(val, oldVal) {
				// console.log("dfTabs:"+typeof(val)+" "+val);
				if (val>=0) {
					var event = {'type':'dfTabs'}
					app.changeModule(event, app.dfMenu[val]);
				}
			}
		}
	},

	/** Called after the Vue app has been created. A good place to put startup code */
	created: function() {

		// Example of retrieving data from uibuilder
		this.feVersion = uibuilder.get('version')

		/** **REQUIRED** Start uibuilder comms with Node-RED @since v2.0.0-dev3
		 * Pass the namespace and ioPath variables if hosting page is not in the instance root folder
		 * e.g. If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages.
		 * e.g. uibuilder.start('/uib', '/uibuilder/vendor/socket.io') // change to use your paths/names
		 * @param {Object=|string=} namespace Optional. Object containing ref to vueApp, Object containing settings, or String IO Namespace override. changes self.ioNamespace from the default.
		 * @param {string=} ioPath Optional. changes self.ioPath from the default
		 * @param {Object=} vueApp Optional. Reference to the VueJS instance. Used for Vue extensions.
		 */
		uibuilder.start(this) // Single param passing vue app to allow Vue extensions to be used.

		//console.log(JSON.stringify(this.docData));


		//console.log(this)
		uibuilder.send( {
			'module': this.module,
			'payload': {
				'instruction': 'getJsonLogic',
			}
		} );

		uibuilder.send( {
			'module': this.module,
			'payload': {
				'instruction': 'getFlowList',
			}
		} );

		uibuilder.send( {
			'module': this.module,
			'payload': {
				'instruction': 'getTaskList',
			}
		} );

	}, // --- End of created hook --- //

	/** Called once all Vue component instances have been loaded and the virtual DOM built */
	mounted: function(){

		this.docTable = new Tabulator("#doc-table", {
			minHeight: "300px", 
			maxHeight: "500px", 
			pagination: "local",
			paginationSize: 10,
			autoResize: true,
			resizableColumns: true,
			virtualDomHoz:true,
			data: this.docData, //assign data to table
			layout: "fitColumns", //fit columns to width of table (optional)
			columns: this.docCol
		});

		
		for (var idx in this.dfList) {
			this.dfList[idx].dfTable = new Tabulator("#"+this.dfList[idx].table, {
				minHeight: "300px", 
				maxHeight: "500px", 
				pagination: "local",
				paginationSize: 10,
				autoResize: true,
				resizableColumns: true,
				virtualDomHoz:true,
				data: this.dfList[idx].dfData, //assign data to table
				layout: "fitDataStretch", //fit columns to width of table (optional)
				columns: this.dfList[idx].dfCol,
				rowClick:function(e, row){
					var data = row.getData();
					app.dfList[app.dfTabs].name = data.name;
					app.dfList[app.dfTabs].desc = data.desc;
					var tableName = app.dfList[app.dfTabs].field;

					var curData = app.editor.export();
					console.log(curData);
					console.log(data);
					console.log(tableName);
					for (var key in curData.drawflow) {
						if (key == app.dfMenu[app.dfTabs].module) {
							curData.drawflow[key] = data[tableName].drawflow[key]
						} 
					}
					app.editor.import(curData);
					console.log(curData);
					app.changeModule({'type':'record'}, app.dfMenu[app.dfTabs]);
				}
			});
		}

		//console.debug('[indexjs:Vue.mounted] app mounted - setting up uibuilder watchers')

		var app = this	// Reference to `this` in case we need it for more complex functions

		var id = document.getElementById("drawflow");
		app.editor = new Drawflow(id);
		//app.editor.editor_mode = 'fixed';
		app.editor.reroute = true;
		app.editor.force_first_input = true;
		app.editor.start();

		app.editor.addModule('Flow');

/*
		app.editor.on('nodeCreated', function(id) {
			console.log("Node created " + id);
		})

		app.editor.on('nodeRemoved', function(id) {
			console.log("Node removed " + id);
		})

		app.editor.on('nodeSelected', function(id) {
			console.log("Node selected " + id);
		})

		app.editor.on('moduleCreated', function(name) {
			console.log("Module Created " + name);
		})

		app.editor.on('moduleChanged', function(name) {
			console.log("Module Changed " + name);
		})

		app.editor.on('connectionCreated', function(connection) {
			console.log('Connection created');
			console.log(connection);
		})

		app.editor.on('connectionRemoved', function(connection) {
			console.log('Connection removed');
			console.log(connection);
		})

		app.editor.on('mouseMove', function(position) {
			//console.log('Position mouse x:' + position.x + ' y:'+ position.y);
		})

		app.editor.on('nodeMoved', function(id) {
			console.log("Node moved " + id);
		})

		app.editor.on('zoom', function(zoom) {
			console.log('Zoom level ' + zoom);
		})

		app.editor.on('translate', function(position) {
			//console.log('Translate x:' + position.x + ' y:'+ position.y);
		})

		app.editor.on('addReroute', function(id) {
			console.log("Reroute added " + id);
		})

		app.editor.on('removeReroute', function(id) {
			console.log("Reroute removed " + id);
		})
*/


		// If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
		uibuilder.onChange('msg', function(msg){
			// console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)
			// console.info(JSON.stringify(msg))
			app.msgRecvd = msg
			app.msgsReceived = uibuilder.get('msgsReceived')
			switch (msg.topic) {
				case "menu":
					app.menu = msg.payload.menu;
					break;
				case "dicList":
					app.docData = msg.payload.data
					app.docCol = msg.payload.config.col
					app.docTable.setColumns(app.docCol)
					app.docTable.setData(app.docData)
					break;
				case "jsonLogicList":
					// console.log("jsonLogicList");
					app.jLogicList = msg.payload.data
					// console.log(app.jLogicList);
					break;
				case "notification":
					app.makeToast(msg.payload.data, true);
					break;
				case "flowList":
					app.dfList[1].dfData = msg.payload.data
					app.dfList[1].dfCol = msg.payload.config.col
					// console.log("msg.payload.config.col");
					// console.log(msg.payload.config.col);
					app.dfList[1].dfTable.setColumns(app.dfList[1].dfCol)
					app.dfList[1].dfTable.setData(app.dfList[1].dfData)
					app.jFlowList = msg.payload.data
					break;
				case "taskList":
					app.dfList[0].dfData = msg.payload.data
					app.dfList[0].dfCol = msg.payload.config.col
					// console.log("msg.payload.config.col");
					// console.log(msg.payload.config.col);
					app.dfList[0].dfTable.setColumns(app.dfList[0].dfCol)
					app.dfList[0].dfTable.setData(app.dfList[0].dfData)
					break;
				case "svg_tok":
					app.vis_tok = msg.payload.data;
					break;
			}
		})

		//#region ---- Debug info, can be removed for live use ---- //

		/** You can use the following to help trace how messages flow back and forth.
		 * You can then amend this processing to suite your requirements.
		 */

		// If we receive a control message from Node-RED, we can get the new data here - we pass it to a Vue variable
		uibuilder.onChange('ctrlMsg', function(msg){
			//console.info('[indexjs:uibuilder.onChange:ctrlMsg] CONTROL msg received from Node-RED server:', msg)
			app.msgCtrl = msg
			app.msgsControl = uibuilder.get('msgsCtrl')
		})

		/** You probably only need these to help you understand the order of processing
		 * If a message is sent back to Node-RED, we can grab a copy here if we want to
		 */
		uibuilder.onChange('sentMsg', function(msg){
			//console.info('[indexjs:uibuilder.onChange:sentMsg] msg sent to Node-RED server:', msg)
			app.msgSent = msg
			app.msgsSent = uibuilder.get('msgsSent')
		})

		/** If we send a control message to Node-RED, we can get a copy of it here */
		uibuilder.onChange('sentCtrlMsg', function(msg){
			//console.info('[indexjs:uibuilder.onChange:sentCtrlMsg] Control message sent to Node-RED server:', msg)
			app.msgCtrlSent = msg
			app.msgsCtrlSent = uibuilder.get('msgsSentCtrl')
		})

		/** If Socket.IO connects/disconnects, we get true/false here */
		uibuilder.onChange('ioConnected', function(connected){
			// console.info('[indexjs:uibuilder.onChange:ioConnected] Socket.IO Connection Status Changed to:', connected)
			app.socketConnectedState = connected
			
		})
		/** If Server Time Offset changes */
		uibuilder.onChange('serverTimeOffset', function(serverTimeOffset){
			//console.info('[indexjs:uibuilder.onChange:serverTimeOffset] Offset of time between the browser and the server has changed to:', serverTimeOffset)
			app.serverTimeOffset = serverTimeOffset
		})

		/** If user is logged on/off */
		uibuilder.onChange('isAuthorised', function(isAuthorised){
			//console.info('[indexjs:uibuilder.onChange:isAuthorised] isAuthorised changed. User logged on?:', isAuthorised)
			//console.log('authData: ', uibuilder.get('authData'))
			//console.log('authTokenExpiry: ', uibuilder.get('authTokenExpiry'))
			app.isLoggedOn = isAuthorised
		})

		//#endregion ---- Debug info, can be removed for live use ---- //

	}, // --- End of mounted hook --- //

}) // --- End of app1 --- //

// EOF
