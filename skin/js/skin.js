/* responsive managment */
var responsive = {
	fColNum : null,
	fListeners : {layoutChange:[]},
	init:function() {
		var vOneCol = window.matchMedia("(max-width: 800px)");
		vOneCol.addListener(function(pMatch){
			if (pMatch.matches) responsive.setColumns(1);
			else responsive.setColumns(2);
		});
		if (vOneCol.matches) this.setColumns(1);
		else this.setColumns(2);
	},
	registerListener : function(pListener, pFunc){
		if (this.fListeners[pListener]) this.fListeners[pListener].push(pFunc);
	},
	fireEvent : function(pListener, pParam){
		if (this.fListeners[pListener]) {
			for (var i=0; i< this.fListeners[pListener].length; i++) {
				try{
					this.fListeners[pListener][i](pParam);
				} catch(e){}
			}
		}
	},
	getColumns:function() {
		return this.fColNum;
	},
	setColumns:function(pNum) {
		this.fColNum = pNum;
		this.fireEvent("layoutChange", pNum);
	}
};

// Skin specific Javascript code - use sparingly and with caution
(function (){
	if ("scAssmntMgr" in window){
		scAssmntMgr.xGmcqInitMarker = function(pElt, pMgr){}
	}
	/* ajout label derrière inputs des choiceList pour stylage*/
	try{
		var vInputs=scPaLib.findNodes("des:.choiceList_in/des:input");
		for (i = 0; i < vInputs.length; i++) {
			var vLabel = document.createElement("label");
			vLabel.setAttribute("for", vInputs[i].id);
			vInputs[i].parentNode.appendChild(vLabel);
		}
	}catch(e){}

	if ("dokielMgr" in window){
		dokielMgr.fPlayerCtrlModeCss = true;
		dokielMgr.fPlayerDefaultStepMode = true;
	}

	if (scPaLib.checkNode(".tplGuide", sc$("page"))) {
		document.body.fMenu = localStorage.getItem("menuActive")!="false";
		if (document.body.fMenu){
			document.body.classList.add("menuActive");
		}else{
			document.body.classList.add("menuInactive");
		}
		var vBtn = scDynUiMgr.addElement("button", sc$("header"), "showMenu");
		vBtn.onclick = function(){
			if (document.body.fMenu){
				document.body.classList.remove("menuActive");
				document.body.classList.add("menuInactive");
			} else {
				document.body.classList.add("menuActive");
				document.body.classList.remove("menuInactive");
			}
			document.body.fMenu = !document.body.fMenu;
			if(responsive.getColumns()==2) localStorage.setItem("menuActive", document.body.fMenu);
		}
		vBtn.innerHTML = '<span>☰</span>';
		responsive.registerListener("layoutChange", function(pNumCols){
			if (pNumCols == 1){
				document.body.classList.add("oneColumn");
				document.body.classList.remove("twoColumn");
				if (document.body.fMenu){
					document.body.fMenu = false;
					document.body.classList.remove("menuActive");
					document.body.classList.add("menuInactive");
				}
			} else {
				document.body.classList.remove("oneColumn");
				document.body.classList.add("twoColumn");
				if (!document.body.fMenu && localStorage.getItem("menuActive")!="false"){
					document.body.fMenu = true;
					document.body.classList.add("menuActive");
					document.body.classList.remove("menuInactive");
				}
			}
		});
		responsive.init();
	}
})();

/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
	var currentScrollPos = window.pageYOffset,
		vBody = document.body;
	if (prevScrollpos < currentScrollPos) {
		tplMgr.xSwitchClass(vBody, "nav_stuck_no", "nav_stuck_yes", true);
	}
	else {
		tplMgr.xSwitchClass(vBody, "nav_stuck_yes", "nav_stuck_no");
	}
	prevScrollpos = currentScrollPos;
};
