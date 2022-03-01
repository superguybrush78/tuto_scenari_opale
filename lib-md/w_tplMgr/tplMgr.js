/**
 * LICENCE[[
 * Version: MPL 2.0/GPL 3.0/LGPL 3.0/CeCILL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is 
 * samuel.monsarrat@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2009-2018
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 3.0 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 3.0 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.1 (http://www.cecill.info),
 * in which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL, the LGPL or the CeCILL, and not to allow
 * others to use your version of this file under the terms of the MPL, indicate
 * your decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL, the LGPL or the CeCILL. If you do not
 * delete the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL, the LGPL or the CeCILL.
 * ]]LICENCE
 */

var tplMgr = {
	fCbkPath : "des:.cbkClosed",
	fCbkInit : true,
	fNoAjax : false,

	fStrings : ["Retour à la page en cours du contenu","",
	/*02*/      "Cacher le contenu de \'%s\'","Afficher le contenu de \'%s\'",
	/*04*/      "Ce site utilise un système de mesure d\'audience qui nécessite l\'utilisation de cookies pour comprendre et améliorer l\'expérience du visiteur.","",
	/*06*/      "Accepter","Refuser",
	/*08*/      "Cookies","Gestion des cookies",
	/*10*/      "Le chargement dynamique de ressources est désactivé.\n\nLes restrictions sécuritaires de votre navigateur interdisent l\'utilisation de certaines fonctionnalités telles que la recherche ou l\'exploration du menu.",""],

	init : function() {
		try{
			this.fStore = new this.LocalStore();
			var vPageType = sc$("page").getAttribute("data-type");
			this.fIsGuidePage = vPageType == "guide";
			this.fIsToolsPage = vPageType == "tools";
			this.fIsSubPage = vPageType == "sub";
			this.fIsEvalPage = vPageType == "eval";

			if (this.fIsGuidePage) this.fStore.set("guideUrl", document.location.href);

			this.fCurrentUrl = scCoLib.hrefBase();
			this.fPageCurrent = scServices.scLoad.getUrlFromRoot(this.fCurrentUrl);
			this.initDom();

			if (typeof _CookieWarn == "undefined") _CookieWarn = false;
			if (_CookieWarn){
				var vCookieWarnBar = this.fCookieWarnBar = scDynUiMgr.addElement("div", scPaLib.findNode("bod:"), "cookieWarnBar" + (localStorage.getItem("AcknowledgeAnalytics") ? " acknowledged" : ""), scPaLib.findNode("bod:/chi:"));
				var vMsgBox = scDynUiMgr.addElement("span", vCookieWarnBar, "cookieWarnMsg")
				var vMsg = this.fStrings[_CookieWarn=="analytics" ? 4 : 5];
				vMsgBox.innerHTML = vMsg + " ";
				var vBtnOk = scDynUiMgr.addElement("a", vCookieWarnBar, "cookieWarnBtnOk");
				vBtnOk.setAttribute("role", "button");
				vBtnOk.href = "#";
				vBtnOk.innerHTML = '<span>'+this.fStrings[6]+'</span>';
				vBtnOk.onclick = function(){
					var vIsActive = localStorage.getItem("ActivateAnalytics");
					localStorage.setItem("ActivateAnalytics", true);
					localStorage.setItem("AcknowledgeAnalytics", true);
					tplMgr.fCookieWarnBar.classList.add("acknowledged");
					tplMgr.xSwitchClass(scPaLib.findNode("bod:"), "cookieWarnBar_on", "cookieWarnBar_off", true);
					if (!vIsActive) window.location.reload();
					return false;
				}
				var vBtnNok = scDynUiMgr.addElement("a", vCookieWarnBar, "cookieWarnBtnNok");
				vBtnNok.setAttribute("role", "button");
				vBtnNok.href = "#";
				vBtnNok.innerHTML = '<span>'+this.fStrings[7]+'</span>';
				vBtnNok.onclick = function(){
					var vIsActive = localStorage.getItem("ActivateAnalytics");
					localStorage.removeItem("ActivateAnalytics");
					localStorage.setItem("AcknowledgeAnalytics", true);
					tplMgr.fCookieWarnBar.classList.add("acknowledged");
					tplMgr.xSwitchClass(scPaLib.findNode("bod:"), "cookieWarnBar_on", "cookieWarnBar_off", true);
					if (vIsActive) window.location.reload();
					return false;
				}
				var vBtnBar = scDynUiMgr.addElement("a", scPaLib.findNode("ide:footer/des:.btnSc/par:"), "cookieWarnBtnBar", scPaLib.findNode("ide:footer/des:.btnSc"));
				vBtnBar.setAttribute("role", "button");
				vBtnBar.setAttribute("title", this.fStrings[9]);
				vBtnBar.href = "#";
				vBtnBar.innerHTML = '<span>'+this.fStrings[8]+'</span>';
				vBtnBar.onclick = function(){
					localStorage.removeItem("AcknowledgeAnalytics");
					tplMgr.fCookieWarnBar.classList.remove("acknowledged");
					tplMgr.xSwitchClass(scPaLib.findNode("bod:"), "cookieWarnBar_off", "cookieWarnBar_on", true);
					return false;
				}
				document.body.classList.add("cookieWarnBar_"+(localStorage.getItem("AcknowledgeAnalytics") ? "off" : "on"))
			}

			// Callback functions and liseners
			if ("scDynUiMgr" in window) {
				scDynUiMgr.collBlk.addOpenListener(this.sCollBlkOpen);
				scDynUiMgr.collBlk.addCloseListener(this.sCollBlkClose);
			}
			if ("scTooltipMgr" in window ) {
				scTooltipMgr.addShowListener(this.sTtShow);
				scTooltipMgr.addHideListener(this.sTtHide);
			}
			window.addEventListener("hashchange", function(pEvt){
				tplMgr.hashCheck();
			}, false);
		}catch(e){scCoLib.log("ERROR - tplMgr.init : "+e)}
	},
	
	initDom : function() {
		//Section outline
		this.fSecOutCo = scPaLib.findNode("des:div.secOutFra/chi:div.secOutUi/chi:ol");
		if(this.fSecOutCo){
			this.fSecOutBtn = scPaLib.findNode("des:div.secOutFra/chi:div.secOutTi/chi:a");
			if(this.fStore.get("secOutCollapse")=="true") this.secOutToggle();
		}

		// Close collapsable blocks that are closed by default.
		if (this.fCbkInit){
			var vHash = window.location.hash;
			if (vHash.length>0); vHash = vHash.substring(1);
			var vCbks = scPaLib.findNodes(this.fCbkPath);
			for (var i=0; i<vCbks.length; i++) {
				if (!vHash || vHash && vHash != scPaLib.findNode("chi:", vCbks[i]).id) {
					var vTgl = scPaLib.findNode("des:a", vCbks[i]);
					if (vTgl) vTgl.onclick();
				}
			}
		}
		if (!this.fIsGuidePage) {
			var vRetBtn = scPaLib.findNode("ide:menu/des:a");
			var vRetUrl = this.fStore.get("guideUrl");
			if (vRetBtn && vRetUrl){
				vRetBtn.setAttribute("href", vRetUrl);
				vRetBtn.title = this.fStrings[0];
			}
			// Map outline
			var vMnuItems = scPaLib.findNodes("ide:content/des:ul.sw_outMap_navList/des:a.mnuSel_no");
			if (vRetUrl && vMnuItems && vMnuItems.length>0){
				var vPage = vRetUrl.substring(vRetUrl.lastIndexOf("/")+1);
				var vFound=false;
				for(var i = 0; i < vMnuItems.length; i++) {
					var vMnuItem = vMnuItems[i];
					if(vMnuItem.href.substring(vMnuItem.href.lastIndexOf("/")+1) == vPage){
						vMnuItem.className = vMnuItem.className.replace("mnuSel_no","mnuSel_yes");
						vFound=true;
						break;
					}
				}
				if (!vFound) vMnuItems[0].className = vMnuItems[0].className.replace("mnuSel_no","mnuSel_yes");
			}
		}
	},
	
	makeVisible : function(pNode){
		// Ouvre bloc collapsable contenant pNode
		var vCollBlk = scPaLib.findNode("anc:.collBlk_closed",pNode);
		if(vCollBlk) vCollBlk.fTitle.onclick();
	},

	setExpandAll : function(pExpand){
		if ("dokielMgr" in window){
			if (pExpand) dokielMgr.cancelStepMode();
			dokielMgr.setInteractiveScreenMode(!pExpand);
		}
		if("scSiLib" in window) scSiLib.fireResizedNode(sc$("main"));
	},

	secOutToggle : function() {
		if (!this.fSecOutCo || !this.fSecOutBtn) return false;
		scDynUiMgr.collBlkToggle(this.fSecOutBtn,this.fSecOutCo,"secOut_op","secOut_cl");
		this.fStore.set("secOutCollapse", this.fSecOutCo.style.display == "none");
		return false;
	},

	hashCheck : function(){
		var vHash = window.location.hash;
		if (vHash.length>0); vHash = vHash.substring(1);

		if (vHash=="outline") document.body.classList.toggle("outline", true);
		else document.body.classList.toggle("outline", false);
	},

	loadPage : function(pUrl){
		if (pUrl && pUrl.length>0) {
			window.location.href = scServices.scLoad.getPathFromRoot(pUrl);
		}
	},

	scrollTo : function(pId){
		this.loadPage(this.fPageCurrent +"#" + pId);
	},

	/** isNoAjax */
	isNoAjax : function(){
		return this.fNoAjax;
	},
	/** setNoAjax */
	setNoAjax : function(){
		if (!this.fNoAjaxWarn) alert(this.fStrings[10]);
		this.fNoAjax = true;
		this.fNoAjaxWarn = true;
	},
/* === Callback functions =================================================== */
	/** Tooltip lib show callback */
	sTtShow: function(pNode) {
		if (!pNode.fOpt.FOCUS && !pNode.onblur) pNode.onblur = function(){scTooltipMgr.hideTooltip(true);};
	},
	/** Tooltip lib hide callback : this = scTooltipMgr */
	sTtHide: function(pNode) {
		if (pNode) pNode.focus();
	},
	/** Collapable block Callback functions. */
	sCollBlkOpen: function(pCo, pTitle) {
		if (pTitle) pTitle.title = tplMgr.fStrings[2].replace("%s", (pTitle.innerText ? pTitle.innerText: pTitle.textContent));
	},
	sCollBlkClose: function(pCo, pTitle) {
		if (pTitle) pTitle.title = tplMgr.fStrings[3].replace("%s", (pTitle.innerText ? pTitle.innerText: pTitle.textContent));
	},

/* === Utilities ============================================================ */
	/** tplMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		if (pTitle) vBtn.setAttribute("title", pTitle);
		if (pCapt) vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},

	/** tplMgr.xSwitchClass - replace a class name. */
	xSwitchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
		var vAddIfAbsent = typeof pAddIfAbsent == "undefined" ? false : pAddIfAbsent;
		var vMatchExact = typeof pMatchExact == "undefined" ? true : pMatchExact;
		var vClassName = pNode.className;
		var vReg = new RegExp("\\b"+pClassNew+"\\b");
		if (vMatchExact && vClassName.match(vReg)) return;
		var vClassFound = false;
		if (pClassOld && pClassOld != "") {
			if (vClassName.indexOf(pClassOld)==-1){
				if (!vAddIfAbsent) return;
				else if (pClassNew && pClassNew != '') pNode.className = vClassName + " " + pClassNew;
			} else {
				var vCurrentClasses = vClassName.split(' ');
				var vNewClasses = new Array();
				for (var i = 0, n = vCurrentClasses.length; i < n; i++) {
					var vCurrentClass = vCurrentClasses[i];
					if (vMatchExact && vCurrentClass != pClassOld || !vMatchExact && vCurrentClass.indexOf(pClassOld) != 0) {
						vNewClasses.push(vCurrentClasses[i]);
					} else {
						if (pClassNew && pClassNew != '') vNewClasses.push(pClassNew);
						vClassFound = true;
					}
				}
				pNode.className = vNewClasses.join(' ');
			}
		}
		return vClassFound;
	},

	/** Local Storage API (localStorage/userData/cookie) */
	LocalStore : function (pId){
		if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
		this.fId = pId || "";
		this.fRootKey = document.location.pathname.substring(0,document.location.pathname.lastIndexOf("/")) +"/";
		if (typeof localStorage != "undefined") {
			this.get = function(pKey) {var vRet = localStorage.getItem(this.fRootKey+this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
			this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
		} else if (window.ActiveXObject){
			this.get = function(pKey) {this.xLoad();return this.fIE.getAttribute(this.xEsc(pKey))};
			this.set = function(pKey, pVal) {this.fIE.setAttribute(this.xEsc(pKey), pVal);this.xSave()};
			this.xLoad = function() {this.fIE.load(this.fRootKey+this.fId)};
			this.xSave = function() {this.fIE.save(this.fRootKey+this.fId)};
			this.fIE=document.createElement('div');
			this.fIE.style.display='none';
			this.fIE.addBehavior('#default#userData');
			document.body.appendChild(this.fIE);
		} else {
			this.get = function(pKey){var vReg=new RegExp(this.xKey(pKey)+"=([^;]*)");var vArr=vReg.exec(document.cookie);if(vArr && vArr.length==2) return(unescape(vArr[1]));else return null};
			this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
		}
		this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
		this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
	}
}
