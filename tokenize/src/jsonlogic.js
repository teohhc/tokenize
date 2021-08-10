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
		module      : 'jsonlogic',
        feVersion   : '',
        socketConnectedState : false,
        serverTimeOffset     : '[unknown]',
        imgProps             : { width: 75, height: 75 },
		catList     : null,
		cat         : null,
		logicTab    : null,
		logicList   : null,
		logicCol    : [],
		logicData   : [],

		logic_name  : null,
		logic_desc  : null,
		logic_area  : 'null',
		
		toastCount  : 0,

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
		menu        : []

    }}, // --- End of data --- //

    computed: {

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

        updateJSONarea: function() {
            //document.getElementById('logic_area').value = Blockly.JSON.fromWorkspace( Blockly.getMainWorkspace() );
			this.logic_area = Blockly.JSON.fromWorkspace( Blockly.getMainWorkspace());
        },

        interpretJSONarea: function() {
			// console.log("logic_are:")
			// console.log(this.logic_area);
			Blockly.JSON.toWorkspace( this.logic_area, Blockly.getMainWorkspace() );
            //Blockly.JSON.toWorkspace( document.getElementById('logic_area').value, Blockly.getMainWorkspace() );
        },

        interpretToJSONarea: function(logic) {
			Blockly.JSON.toWorkspace( logic, Blockly.getMainWorkspace() );
        },

		saveRule: function(event) {
            var payload = {
                    'instruction': 'saveJsonLogic',
                    'category': this.cat,
					'record': {
						'cat': this.cat,
						'name': this.logic_name,
						'desc': this.logic_desc,
						'jsonlogic': JSON.parse(this.logic_area),
					}
            };
            this.doServerReq(payload);
		},

        switchCat: function(event) {
            var payload = {
                    'instruction': 'getJsonLogic',
                    'category': this.cat
            };
            this.doServerReq(payload);
        },

        doServerReq: function(payload) {
            uibuilder.send( {
                'topic': payload.instruction,
                'module': this.module,
                'payload': payload
            });
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

    }, // --- End of methods --- //

    // Available hooks: beforeCreate,created,beforeMount,mounted,beforeUpdate,updated,beforeDestroy,destroyed, activated,deactivated, errorCaptured

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
                'instruction': 'getCategories',
            }
        } );

    }, // --- End of created hook --- //

    /** Called once all Vue component instances have been loaded and the virtual DOM built */
    mounted: function(){

        //console.debug('[indexjs:Vue.mounted] app mounted - setting up uibuilder watchers')

        var app = this  // Reference to `this` in case we need it for more complex functions

		var blocklyArea = document.getElementById('blocklyArea');
		var blocklyDiv = document.getElementById('blocklyDiv');
		var workspace = Blockly.inject(document.getElementById('blocklyDiv'), {
			//rtl: true,
			toolbox: document.getElementById('toolbox'),
			media: '/JSONLogic-Editor/media/',    // to avoid reaching to the web for icons
			sound: false,
			collapse: true, comments: true, disable: false, scrollbars: true, trashcan: true, drag: true // those ones are automatically true when there are categories
		});

		var onresize =  function(e) {
			// console.log("resizing...");
			// Compute the absolute coordinates and dimensions of blocklyArea.
			var element = blocklyArea;
			var x = 0;
			var y = 0;
			do {
				x += element.offsetLeft;
				y += element.offsetTop;
				element = element.offsetParent;
			} while (element);
			// Position blocklyDiv over blocklyArea.
			blocklyDiv.style.left = x + 'px';
			blocklyDiv.style.top = y + 'px';
			blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
			blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
			Blockly.svgResize(workspace);
		};

		window.addEventListener('resize', onresize, false);
		onresize();
		Blockly.svgResize(workspace);
		//this.logic_area = 'null';
		Blockly.JSON.toWorkspace( this.logic_area, Blockly.getMainWorkspace() ); // dogfooding: load the initial state using our own JSON converter

		Blockly.addChangeListener(this.updateJSONarea);

		this.logicTab = new Tabulator("#logic-table", {
            minHeight: "50px",
            maxHeight: "220px",
            pagination: "local",
            paginationSize: 5,
            autoResize: true,
            resizableColumns: true,
            virtualDomHoz:true,
            data: this.logicData, //assign data to table
            layout: "fitColumns", //fit columns to width of table (optional)
            columns: this.logicCol,
			rowClick:function(e, row){
				var data = row.getData();
				//this.logic_name = data.name;
				//this.logic_area = JSON.stringify(data.jsonlogic);
				var ln = document.getElementById("logic_name");
				var ld = document.getElementById("logic_desc");
				var la = document.getElementById("logic_area");

				ln.value = data.name;
				ln.dispatchEvent(new Event('input'));

				ld.value = data.description;
				ld.dispatchEvent(new Event('input'));

				//la.value = JSON.stringify(data.jsonlogic);
				//la.dispatchEvent(new Event('input'));

				app.interpretToJSONarea(JSON.stringify(data.jsonlogic));
			}
        });


        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        uibuilder.onChange('msg', function(msg){
            // console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)
			// console.info(JSON.stringify(msg))
            app.msgRecvd = msg
            app.msgsReceived = uibuilder.get('msgsReceived')
			switch (msg.topic) {
				case "menu":
					app.menu = msg.payload.menu
					break;
				case "listCat":
                    app.catList = msg.payload.catList
                    break;
				case "jsonlogicList":
                    app.logicData = msg.payload.data
                    app.logicCol = msg.payload.columns
					app.logicTab.setColumns(app.logicCol)
					app.logicTab.setData(app.logicData)
                    break;
				case "notification":
					//alert(msg.payload.data);
					app.makeToast(msg.payload.data, true);
					break;
			}
        })

        //#region ---- Debug info, can be removed for live use ---- //

        /** You can use the following to help trace how messages flow back and forth.
         * You can then amend this processing to suite your requirements.
         */

        // If we receive a control message from Node-RED, we can get the new data here - we pass it to a Vue variable
        uibuilder.onChange('ctrlMsg', function(msg){
            // console.info('[indexjs:uibuilder.onChange:ctrlMsg] CONTROL msg received from Node-RED server:', msg)
            app.msgCtrl = msg
            app.msgsControl = uibuilder.get('msgsCtrl')
        })

        /** You probably only need these to help you understand the order of processing
         * If a message is sent back to Node-RED, we can grab a copy here if we want to
         */
        uibuilder.onChange('sentMsg', function(msg){
            // console.info('[indexjs:uibuilder.onChange:sentMsg] msg sent to Node-RED server:', msg)
            app.msgSent = msg
            app.msgsSent = uibuilder.get('msgsSent')
        })

        /** If we send a control message to Node-RED, we can get a copy of it here */
        uibuilder.onChange('sentCtrlMsg', function(msg){
            // console.info('[indexjs:uibuilder.onChange:sentCtrlMsg] Control message sent to Node-RED server:', msg)
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
