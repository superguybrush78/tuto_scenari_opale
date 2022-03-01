var dokielMgr = scOnLoads[scOnLoads.length] = {

	fPathPlayer : ["des:.stepListPlayer"],
	fPathSteps : "chi:ol/chi:.step",
	fPathOp : "anc:.stepList",
	fClsPreSlp : "slp",
	fPathFocusables : "des:a|input|button",
	fPlayerCtrlModeCss : false,
	fPlayerDefaultStepMode : false,

	fScreens : null,
	fPathScreen : ["des:.screenFra"],
	fPathZones : "des:.screenZone",
	fPathZoneList : "des:ul.screenZones",
	fPathZoneLnks : "des:a.screenZoneLnk",
	fPathTitleFra : "des:div.screenTitles",
	fPathZoneTitles : "des:div.screenTitles/des:li",
	fClsPreScr : "scr",

	fStepScreens : [],
	fPathStepScreen : ["des:.stepScreen"],
	fClsPreSsp : "ssp"

}
dokielMgr.fStrings = ["Mode pas à pas","Afficher les étapes une à une",
	/*02*/                "Mode liste","Afficher les étapes en liste",
	/*04*/                "précédent","étape précédente",
	/*06*/                "suivant","étape suivante",
	/*08*/                "Étape : ","",
	/*10*/                "Mode liste","Afficher les zones en liste",
	/*12*/                "Mode interactif","Afficher les zones en mode interactif",
	"",""];

/** dokielMgr.init */
dokielMgr.init = function() {
	try{
		// Init players...
		this.fScreens = [];
		for(var i=0; i<this.fPathScreen.length; i++) {
			var vScreens = scPaLib.findNodes(this.fPathScreen[i]);
			for(var j=0; j<vScreens.length; j++) {
				var vScreen = vScreens[j];
				vScreen.fZones = scPaLib.findNodes(this.fPathZones,vScreen);
				for(var k=0; k<vScreen.fZones.length; k++) {
					var vZone = vScreen.fZones[k];
					vZone.style.visibility = "hidden";
					vZone.style.position = "absolute";
					vZone.style.left = "-20000px";
					vZone.style.top = "-20000px";
				}
				this.fScreens.push(vScreen);
			}
		}
		for(var i=0; i<this.fPathStepScreen.length; i++) {
			var vStepScreens = this.fStepScreens = scPaLib.findNodes(this.fPathStepScreen[i]);
			for(var j=0; j<vStepScreens.length; j++) {
				var vStepScreen = vStepScreens[j];
				this.xSwitchClass(vStepScreens[j], "showSteps_", "showSteps_false", true, false);
			}
		}
	}catch(e){scCoLib.log("ERROR - dokielMgr.init : "+e)}
}
/** dokielMgr.onLoad */
dokielMgr.onLoad = function() {
	this.xIniPlayers();
	this.xIniScreens();
	this.xIniStepScreens();
}
/** dokielMgr.registerPlayer */
dokielMgr.registerPlayer = function(pPath) {
	this.fPathPlayer[this.fPathPlayer.length] = pPath;
}
/** dokielMgr.registerScreen */
dokielMgr.registerScreen = function(pPath) {
	this.fPathScreen[this.fPathScreen.length] = pPath;
}
/** dokielMgr.registerStepScreen */
dokielMgr.registerStepScreen = function(pPath) {
	this.fPathStepScreen[this.fPathStepScreen.length] = pPath;
}
/** dokielMgr.cancelStepMode */
dokielMgr.cancelStepMode = function() {
	if (this.fActiveStepPlayer) this.xSlpLstMode(this.fActiveStepPlayer);
}

/** dokielMgr.setInteractiveScreenMode */
dokielMgr.setInteractiveScreenMode = function(pEnabled) {
	for(var i=0; i<this.fScreens.length; i++) {
		var vScreen = this.fScreens[i];
		if (!pEnabled){
			if (vScreen.fIntMode) {
				this.xScrLstMode(vScreen);
				vScreen.fLstModeForced = true;
			}
			vScreen.fToolbar.style.display = "none";
		} else {
			if (vScreen.fLstModeForced) {
				this.xScrIntMode(vScreen);
				vScreen.fLstModeForced = false;
			}
			vScreen.fToolbar.style.display = "";
		}
	}
}

/** dokielMgr.xBtnMgr - centralized button manager */
dokielMgr.xBtnMgr = function(pBtn) {
	var vFra = pBtn.fFra;
	switch(pBtn.fName){
		case this.fClsPreSlp + "BtnStp":
			dokielMgr.xSlpStpMode(vFra);
			dokielMgr.xToggleFocusables(vFra.parentNode);
			vFra.fBtnNxt.focus();
			break;
		case this.fClsPreSlp + "BtnLst":
			dokielMgr.xSlpLstMode(vFra);
			dokielMgr.xToggleFocusables(vFra.parentNode);
			vFra.fBtnStep.focus();
			break;
		case this.fClsPreSlp + "BtnPrv":
			dokielMgr.xSlpPrv(vFra);break;
		case this.fClsPreSlp + "BtnNxt":
			dokielMgr.xSlpNxt(vFra);break;

		case this.fClsPreScr + "BtnLst":
			dokielMgr.xScrLstMode(vFra);break;
		case this.fClsPreScr + "BtnAct":
			dokielMgr.xScrIntMode(vFra);break;

		case this.fClsPreSsp + "BtnPrv":
			dokielMgr.xSspPrv(vFra);break;
		case this.fClsPreSsp + "BtnNxt":
			dokielMgr.xSspNxt(vFra);break;
	}
	return false;
}

/* == Screen =============================================================== */
/** dokielMgr.xIniScreens */
dokielMgr.xIniScreens = function() {
	try{
		var vSelectedZone = null;
		var vHash = window.location.hash;
		if (vHash.length>0) vHash = vHash.substring(1);
		else vHash = null;

		for(var i=0; i<this.fScreens.length; i++) {
			var vScreen = this.fScreens[i];
			vScreen.fZoneLnks = scPaLib.findNodes(this.fPathZoneLnks,vScreen);
			vScreen.fTitleFra = scPaLib.findNode(this.fPathTitleFra,vScreen);
			vScreen.fZoneTitles = scPaLib.findNodes(this.fPathZoneTitles,vScreen);
			vScreen.fZoneList = scPaLib.findNode(this.fPathZoneList,vScreen);
			for(var k=0; k<vScreen.fZoneLnks.length; k++) {
				var vZoneLnk = vScreen.fZoneLnks[k];
				vZoneLnk.fZone = vScreen.fZones[k];
				vZoneLnk.fScreen = vScreen;
				vZoneLnk.fImg = scDynUiMgr.addElement("span", vZoneLnk, this.fClsPreScr + "ZneImg", null, {display:"none",position:"absolute",top:"0",bottom:"0",left:"0",right:"0",backgroundImage:'url("'+scPaLib.findNode("des:.screenZone_pre/des:img", vZoneLnk.fZone).src+'")'});
				if (vScreen.fTitleFra){
					vZoneLnk.fTitle = vScreen.fZoneTitles[k];
					vZoneLnk.fTitle.fClass = vZoneLnk.fTitle.className;
					var vTitleLink = scPaLib.findNode("des:a", vZoneLnk.fTitle);
					vTitleLink.fZne = vZoneLnk;
					vTitleLink.onclick = function(){ return this.fZne.onclick()};
				}
				vZoneLnk.onclick = this.sScrLnkClick;
				if (vZoneLnk.fZone.id == vHash) vSelectedZone = vZoneLnk;
			}
			vScreen.className = vScreen.className + " " + this.fClsPreScr + "Fra";
			vScreen.fClass = vScreen.className;

			vScreen.fToolbar = scDynUiMgr.addElement("div", vScreen, this.fClsPreScr + "Tools", vScreen.firstChild);
			vScreen.fBtnList = this.xAddBtn(vScreen.fToolbar, vScreen, this.fClsPreScr + "BtnLst", this.xGetStr(10), this.xGetStr(11));
			vScreen.fBtnAct = this.xAddBtn(vScreen.fToolbar, vScreen, this.fClsPreScr + "BtnAct", this.xGetStr(12), this.xGetStr(13));
			this.xScrIntMode(vScreen);

			for(var k=0; k<vScreen.fZones.length; k++) {
				var vZone = vScreen.fZones[k];
				vZone.style.visibility = "";
				vZone.style.position = "";
				vZone.style.left = "";
				vZone.style.top = "";
			}
		}
		if (vSelectedZone) vSelectedZone.onclick();
	} catch(e){scCoLib.log("dokielMgr.xIniScreens::Error : "+e)}
}

/** dokielMgr.xScrLstMode */
dokielMgr.xScrLstMode = function(pScreen){
	pScreen.fIntMode = false;
	pScreen.className = pScreen.fClass;
	for(var i=0; i<pScreen.fZones.length; i++) {
		pScreen.fZones[i].style.display = "";
		pScreen.fZoneLnks[i].fImg.style.display = "none";
		pScreen.fZoneLnks[i].fAct = false;
		if("scImgMgr" in window) scImgMgr.sCollBlkOpen(pScreen.fZones[i]);
		if (pScreen.fTitleFra) pScreen.fZoneTitles[i].className = pScreen.fZoneTitles[i].fClass;
	}
	pScreen.fZoneList.setAttribute("aria-live", "polite");
	pScreen.fBtnList.setAttribute("aria-selected", "true");
	pScreen.fBtnAct.setAttribute("aria-selected", "false");
	if("scSiLib" in window) scSiLib.fireResizedNode(pScreen);
}

/** dokielMgr.xScrIntMode */
dokielMgr.xScrIntMode = function(pScreen){
	pScreen.fIntMode = true;
	pScreen.className = pScreen.fClass + " " + this.fClsPreScr + "FraInt";
	for(var i=0; i<pScreen.fZones.length; i++) pScreen.fZones[i].style.display = "none";
	pScreen.fZoneList.removeAttribute("aria-live");
	pScreen.fBtnList.setAttribute("aria-selected", "false");
	pScreen.fBtnAct.setAttribute("aria-selected", "true");
	if("scSiLib" in window) scSiLib.fireResizedNode(pScreen);
}

/** dokielMgr.sScrLnkClick */
dokielMgr.sScrLnkClick = function(pEvt){
	if (this.fScreen.fIntMode){
		var vAct = this.fAct;
		for(var i=0; i<this.fScreen.fZones.length; i++) {
			this.fScreen.fZones[i].style.display = "none";
			this.fScreen.fZoneLnks[i].fImg.style.display = "none";
			this.fScreen.fZoneLnks[i].fAct = false;
			if (this.fScreen.fTitleFra) this.fScreen.fZoneTitles[i].className = this.fScreen.fZoneTitles[i].fClass;
		}
		if (vAct){
			this.fAct = false;
			this.fScreen.className = this.fScreen.fClass + " " + dokielMgr.fClsPreScr + "FraInt";
		} else {
			this.fAct = true;
			this.fZone.style.display = "";
			this.fImg.style.display = "";
			this.fScreen.className = this.fScreen.fClass + " " + dokielMgr.fClsPreScr + "FraAct";
			if (this.fTitle) {
				this.fTitle.className = this.fTitle.fClass + " " + dokielMgr.fClsPreScr + "TiAct";
				if (this.fTitle.offsetTop < this.fScreen.fTitleFra.scrollTop) this.fScreen.fTitleFra.scrollTop = this.fTitle.offsetTop;
				else if (this.fTitle.offsetTop+this.fTitle.offsetHeight > this.fScreen.fTitleFra.scrollTop + this.fScreen.fTitleFra.clientHeight) this.fScreen.fTitleFra.scrollTop = this.fTitle.offsetTop + this.fTitle.offsetHeight - this.fScreen.fTitleFra.clientHeight;
			}
		}
		if("scImgMgr" in window) scImgMgr.sCollBlkOpen(this.fZone);
		if("scSiLib" in window) scSiLib.fireResizedNode(this.fScreen);
		return false;
	} else {
		return true;
	}
}

/* == Screen procedure ===================================================== */
/** dokielMgr.xIniStepScreens */
dokielMgr.xIniStepScreens = function() {
	try{
		var vSelectedZone = null;
		var vHash = window.location.hash;
		if (vHash.length>0) vHash = vHash.substring(1);
		else vHash = null;

		for(var i=0; i<this.fStepScreens.length; i++) {
			var vStepScreen = this.fStepScreens[i];
			var vSteps = vStepScreen.fSteps = scPaLib.findNodes("chi:ol.steps/chi:li.step", vStepScreen);
			var vStepTitles = vStepScreen.fTitles = scPaLib.findNodes("des:div.stepScreenTitles/des:li.screenStep", vStepScreen);
			var vStepZones = vStepScreen.fZones = scPaLib.findNodes("des:div.screenImage/des:a.screenStepLnk", vStepScreen);
			vStepScreen.fTitleParent = scPaLib.findNode("des:div.stepScreenTitles/des:ol", vStepScreen);
			var vToolbar = scDynUiMgr.addElement("div", scPaLib.findNode("des:div.stepScreenTitles", vStepScreen), "stepScreenTools");
			vStepScreen.fBtnPrv = this.xAddBtn(vToolbar, vStepScreen, this.fClsPreSsp + "BtnPrv", this.xGetStr(4), this.xGetStr(5));
			this.xAddSep(vToolbar);
			vStepScreen.fCount = scDynUiMgr.addElement("span", vToolbar, "stepScreenCounter");
			this.xAddSep(vToolbar);
			vStepScreen.fBtnNxt = this.xAddBtn(vToolbar, vStepScreen, this.fClsPreSsp + "BtnNxt", this.xGetStr(6), this.xGetStr(7));
			vStepScreen.fIdx = -1;
			for (var j = 0; j<vStepZones.length; j++){
				var vStepZone = vStepZones[j];
				vStepZone.fIdx = j;
				vStepZone.fStepScreen = vStepScreen;

				var vStepTitle = scPaLib.findNode("des:a", vStepTitles[j]);
				vStepTitle.fIdx = j;
				vStepTitle.fStepScreen = vStepScreen;

				vStepZone.onclick = vStepTitle.onclick = function () {
					this.fStepScreen.fIdx = (this.fStepScreen.fIdx == this.fIdx ? -1 : this.fIdx);
					dokielMgr.xSspUpdate(this.fStepScreen);
					return false;
				}
				if (vSteps[j].id == vHash) vSelectedZone = vStepZone;
			}
		}
		if (vSelectedZone) vSelectedZone.onclick();
	} catch(e){scCoLib.log("dokielMgr.xIniStepScreens::Error : "+e)}
}

/** dokielMgr.xSlpPrv */
dokielMgr.xSspPrv = function(pStepScreen){
	if (pStepScreen.fIdx <= 0) return;
	pStepScreen.fIdx--;
	this.xSspUpdate(pStepScreen);
}

/** dokielMgr.xSlpNxt */
dokielMgr.xSspNxt = function(pStepScreen){
	if (pStepScreen.fIdx >= pStepScreen.fSteps.length-1) return;
	pStepScreen.fIdx++;
	this.xSspUpdate(pStepScreen);
}

/** dokielMgr.xSspGotoStep */
dokielMgr.xSspUpdate = function(pStepScreen){

	for (var i = 0; i<pStepScreen.fSteps.length; i++){
		this.xSwitchClass(pStepScreen.fSteps[i], "active_", "active_"+(pStepScreen.fIdx == i), true, false);
		this.xSwitchClass(pStepScreen.fTitles[i], "active_", "active_"+(pStepScreen.fIdx < 0 || pStepScreen.fIdx == i), true, false);
		this.xSwitchClass(pStepScreen.fZones[i], "active_", "active_"+(pStepScreen.fIdx < 0 || pStepScreen.fIdx == i), true, false);
	}
	this.xSwitchClass(pStepScreen, "active_", "active_"+(pStepScreen.fIdx >= 0), true, false);
	this.xSwitchClass(pStepScreen, "showSteps_", "showSteps_"+(pStepScreen.fIdx >= 0), true, false);

	this.xSwitchClass(pStepScreen.fBtnPrv, "disabled_", "disabled_"+(pStepScreen.fIdx <= 0), true, false);
	pStepScreen.fBtnPrv.setAttribute("aria-disabled", (pStepScreen.fIdx <= 0 ? "true" : "false"));
	this.xSwitchClass(pStepScreen.fBtnNxt, "disabled_", "disabled_"+(pStepScreen.fIdx >= pStepScreen.fSteps.length-1), true, false);
	pStepScreen.fBtnNxt.setAttribute("aria-disabled", (pStepScreen.fIdx >= pStepScreen.fSteps.length-1 ? "true" : "false"));
	pStepScreen.fCount.innerHTML = pStepScreen.fIdx<0 ? "" : "<span>"+(pStepScreen.fIdx+1)+"/"+pStepScreen.fSteps.length+"</span>";

	if (pStepScreen.fIdx>=0){
		var vTitle = pStepScreen.fTitles[pStepScreen.fIdx];
		var vScrollParent = pStepScreen.fTitleParent;
		if (vTitle.offsetTop < vScrollParent.scrollTop) vScrollParent.scrollTop = vTitle.offsetTop;
		else if (vTitle.offsetTop+vTitle.offsetHeight > vScrollParent.scrollTop + vScrollParent.clientHeight) vScrollParent.scrollTop = vTitle.offsetTop + vTitle.offsetHeight - vScrollParent.clientHeight;
	}
}


/* == StepList player ====================================================== */
/** dokielMgr.xIniPlayers */
dokielMgr.xIniPlayers = function() {
	try{
		for(var i in this.fPathPlayer) {
			var vPlayers = scPaLib.findNodes(this.fPathPlayer[i]);
			for(var j in vPlayers) {
				var vPlayer = vPlayers[j];
				vPlayer.fOp = scPaLib.findNode(this.fPathOp,vPlayer);
				vPlayer.fOp.fClass = vPlayer.fOp.className;
				vPlayer.fOver = scDynUiMgr.addElement("div", vPlayer.fOp.parentNode, this.fClsPreSlp + "Over", vPlayer.fOp);
				vPlayer.fOver.style.display = "none";
				vPlayer.fSteps = scPaLib.findNodes(this.fPathSteps,vPlayer);
				for(var k in vPlayer.fSteps) {
					var vStep = vPlayer.fSteps[k];
				}
				vPlayer.className = vPlayer.className + " " + this.fClsPreSlp + "Fra";
				vPlayer.fClass = vPlayer.className;
				var vToolbar = scDynUiMgr.addElement("div", vPlayer.parentNode, this.fClsPreSlp + "Tools", vPlayer);
				vPlayer.fBtnStep = this.xAddBtn(vToolbar, vPlayer, this.fClsPreSlp + "BtnStp", this.xGetStr(0), this.xGetStr(1));
				vPlayer.fBtnList = this.xAddBtn(vToolbar, vPlayer, this.fClsPreSlp + "BtnLst", this.xGetStr(2), this.xGetStr(3));
				this.xAddSep(vToolbar);
				vPlayer.fNavBtns = scDynUiMgr.addElement("span", vToolbar, this.fClsPreSlp + "NavBtns");
				vPlayer.fBtnPrv = this.xAddBtn(vPlayer.fNavBtns, vPlayer, this.fClsPreSlp + "BtnPrv", this.xGetStr(4), this.xGetStr(5));
				this.xAddSep(vPlayer.fNavBtns);
				vPlayer.fBtnNxt = this.xAddBtn(vPlayer.fNavBtns, vPlayer, this.fClsPreSlp + "BtnNxt", this.xGetStr(6), this.xGetStr(7));
				this.xAddSep(vPlayer.fNavBtns);
				var vLblCount = scDynUiMgr.addElement("span", vPlayer.fNavBtns, this.fClsPreSlp + "CountLbl");
				vLblCount.innerHTML = "<span>"+this.xGetStr(8)+"</span>"
				vPlayer.fCount = scDynUiMgr.addElement("span", vPlayer.fNavBtns, this.fClsPreSlp + "CountTxt");
				if (this.fPlayerDefaultStepMode) this.xSlpStpMode(vPlayer);
				else this.xSlpLstMode(vPlayer);
			}
		}
	} catch(e){scCoLib.log("dokielMgr.xIniPLayers::Error : "+e)}
}

/** dokielMgr.xSlpStpMode */
dokielMgr.xSlpStpMode = function(pPlayer){
	if (this.fActiveStepPlayer) this.xSlpLstMode(this.fActiveStepPlayer);
	if (this.fPlayerCtrlModeCss){
		this.xSwitchClass(pPlayer.fBtnStep, "disabled_", "disabled_true", true, false);
		pPlayer.fBtnStep.setAttribute("aria-disabled", "true");
		this.xSwitchClass(pPlayer.fBtnList, "disabled_", "disabled_false", true, false);
		pPlayer.fBtnList.setAttribute("aria-disabled", "false");
		this.xSwitchClass(pPlayer.fNavBtns, "disabled_", "disabled_false", true, false);
		pPlayer.fNavBtns.setAttribute("aria-disabled", "false");
	} else{
		pPlayer.fBtnStep.style.display = "none";
		pPlayer.fBtnList.style.display = "";
		pPlayer.fNavBtns.style.display = "";
	}
	pPlayer.fIdx = -1;
	for(var i in pPlayer.fSteps) {
		var vStep = pPlayer.fSteps[i];
		vStep.style.position = "absolute";
		vStep.style.visibility = "hidden";
		vStep.style.left = "-20000px";
		vStep.style.top = "-20000px";
	}
	pPlayer.fOp.className = pPlayer.fOp.fClass + " " + this.fClsPreSlp + "OpAct";
	pPlayer.className = pPlayer.fClass + " " + this.fClsPreSlp + "FraAct";
	pPlayer.fOver.style.display = "";
	this.fActiveStepPlayer = pPlayer;
	if("scSiLib" in window) scSiLib.fireResizedNode(pPlayer);
	this.xSlpNxt(pPlayer);
}

/** dokielMgr.xSlpLstMode */
dokielMgr.xSlpLstMode = function(pPlayer){
	if (this.fPlayerCtrlModeCss){
		this.xSwitchClass(pPlayer.fBtnStep, "disabled_", "disabled_false", true, false);
		pPlayer.fBtnStep.setAttribute("aria-disabled", "false");
		this.xSwitchClass(pPlayer.fBtnList, "disabled_", "disabled_true", true, false);
		pPlayer.fBtnList.setAttribute("aria-disabled", "true");
		this.xSwitchClass(pPlayer.fNavBtns, "disabled_", "disabled_true", true, false);
		pPlayer.fNavBtns.setAttribute("aria-disabled", "true");
	} else{
		pPlayer.fBtnStep.style.display = "";
		pPlayer.fBtnList.style.display = "none";
		pPlayer.fNavBtns.style.display = "none";
	}
	for(var i in pPlayer.fSteps) {
		var vStep = pPlayer.fSteps[i];
		vStep.style.position = "";
		vStep.style.visibility = "";
		vStep.style.left = "";
		vStep.style.top = "";
	}
	pPlayer.fOp.className = pPlayer.fOp.fClass;
	pPlayer.className = pPlayer.fClass;
	pPlayer.fOver.style.display = "none";
	this.fActiveStepPlayer = null;
	if("scSiLib" in window) scSiLib.fireResizedNode(pPlayer);
}

/** dokielMgr.xSlpPrv */
dokielMgr.xSlpPrv = function(pPlayer){
	if (pPlayer.fIdx <= 0) return;
	this.xSlpGotoStep(pPlayer,--pPlayer.fIdx);
}

/** dokielMgr.xSlpNxt */
dokielMgr.xSlpNxt = function(pPlayer){
	if (pPlayer.fIdx >= pPlayer.fSteps.length-1) return;
	this.xSlpGotoStep(pPlayer,++pPlayer.fIdx);
}

/** dokielMgr.xSlpGotoStep */
dokielMgr.xSlpGotoStep = function(pPlayer, pIdx){
	for(var i in pPlayer.fSteps) {
		var vStep = pPlayer.fSteps[i];
		vStep.style.position = (pIdx == i ? "" : "absolute");
		vStep.style.visibility = (pIdx == i ? "" : "hidden");
		vStep.setAttribute("aria-disabled", (pIdx == i ? "false" : "true"));
		vStep.style.left = (pIdx == i ? "" : "-20000px");
		vStep.style.top = (pIdx == i ? "" : "-20000px");
	}
	pPlayer.fBtnPrv.style.visibility = (pPlayer.fIdx <= 0 ? "hidden" : "");
	pPlayer.fBtnPrv.setAttribute("aria-disabled", (pPlayer.fIdx <= 0 ? "true" : "false"));
	pPlayer.fBtnNxt.style.visibility = (pPlayer.fIdx >= pPlayer.fSteps.length-1 ? "hidden" : "");
	pPlayer.fBtnNxt.setAttribute("aria-disabled", (pPlayer.fIdx >= pPlayer.fSteps.length-1 ? "true" : "false"));
	pPlayer.fCount.innerHTML = "<span>"+(pPlayer.fIdx+1)+"/"+pPlayer.fSteps.length+"</span>";
	if (pPlayer.fIdx >= pPlayer.fSteps.length-1) pPlayer.fBtnList.focus();
	if("scSiLib" in window) scSiLib.fireResizedNode(pPlayer);
}

/* == Utils ================================================================ */
/** dokielMgr.xAddSep : Add a simple textual separator : " | ". */
dokielMgr.xAddSep = function(pParent){
	var vSep = document.createElement("span");
	vSep.className = this.fClsPreSlp + "Sep";
	vSep.innerHTML = " | "
	pParent.appendChild(vSep);
}

/** dokielMgr.xAddBtn : Add a HTML button to a parent node. */
dokielMgr.xAddBtn = function(pParent,pFra,pClass,pCapt,pTitle,pNoCmd){
	var vBtn = document.createElement("a");
	vBtn.className = pClass;
	vBtn.fName = pClass;
	vBtn.href = "#";
	vBtn.target = "_self";
	vBtn.setAttribute("role", "button");
	if (!pNoCmd) {
		vBtn.onclick=function(){return dokielMgr.xBtnMgr(this);}
		vBtn.onkeyup=function(pEvent){scDynUiMgr.handleBtnKeyUp(pEvent);}
	}
	vBtn.setAttribute("title",pTitle);
	vBtn.innerHTML="<span>"+pCapt+"</span>";
	vBtn.fFra = pFra;
	pParent.appendChild(vBtn);
	return vBtn;
}

/** dokielMgr.xTogglePageFocus : */
dokielMgr.xToggleFocusables = function(pExludedNode) {
	if (this.fFocusablesDisabled && this.fFocusables){
		for (var i=0; i<this.fFocusables.length; i++){
			this.fFocusables[i].setAttribute("tabindex", "");
		}
		this.fFocusablesDisabled = false;
	} else {
		this.fFocusables = scPaLib.findNodes(this.fPathFocusables);
		for (var i=0; i<this.fFocusables.length; i++){
			var vElt = this.fFocusables[i];
			if (!this.xIsEltContainedByNode(vElt, pExludedNode)) this.fFocusables[i].setAttribute("tabindex", "-1");
		}
		this.fFocusablesDisabled = true;
	}
}

/** dokielMgr.xIsEltContainedByNode : */
dokielMgr.xIsEltContainedByNode = function(pElt, pContainer) {
	var vElt = pElt;
	var vFound = false;
	if (vElt) {
		while (vElt.parentNode && !vFound) {
			vElt = vElt.parentNode;
			vFound = vElt == pContainer;
		}
	}
	return(vFound);
}

/** dokielMgr.xSwitchClass : Replace a CSS class. */
dokielMgr.xSwitchClass = function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
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
}

/** dokielMgr.xGetStr : Reteive a string. */
dokielMgr.xGetStr = function(pStrId) {
	return this.fStrings[pStrId];
}
dokielMgr.loadSortKey = "ZZ";