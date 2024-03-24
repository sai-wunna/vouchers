## this app is built on this boilerplate

```js

const state = 'global { }'
// _pHome.js
function _pHome(){
    const blockState = null
    const $main = NODE
    // inside helper function ( not move to other file as it may use nodes ref )
    function ih_updatePageInfo(){}

    function __setUpFunc(){}
    function __cleanUpFunc(){}

    return [$main,__setUpFunc,__cleanUpFunc]
}
// _spCustomerDetail.js
function _spCustomerDetail(__whenQuitFunc){
    const blockState =  null
    const $main = NODE

    const $backBtn = createButton()
    function handleBack(){
        blockState.cleanMemoTimer = setTimeOut(() => {
            __sleepFunc()
            blockState.cleanMemoTimer = null
        },10000)
    }

    __sleepFunc(){
        __whenQuitFunc

    }

    __setUpFunc(){}
    __cleanUpFunc(){
        if(blockState.cleanMemoTimer){
            clearTimeOut(blockState.cleanMemoTimer)
            blockState.cleanMemoTimer = null
            __sleepFunc()
        }
    }

    return [$main,__setUpFunc,__cleanUpFunc]
}
// _mAddVoucherForm.js ( action modal )
function _mAddVoucherForm( __whenUpdateFunc, __whenSleepFunc){
    const blockState =  null
    const $main = NODE

    __sleepFunc(){
        __whenSleepFunc()
    }
    __setUpFunc(...args){
        // set up data with ...args
    }
    __cleanUpFunc(){

    }

    return [$main,__setUpFunc,__cleanUpFunc]
}
// _nmReceiptPaper.js ( non action modal )
function _cmReceiptPaper(){
    const $main = NODE

    __setUpFunc(...args){
        // set up data with ...args
    }
    __cleanUpFunc(){

    }

    return [$main,__setUpFunc,__cleanUpFunc]
}
// _cDownload.js ( action component )
function _cDownload(__whenSleepFunc){
    const blockState =  null
    const $main = NODE

    __sleepFunc(){
        __whenSleepFunc()
    }
    __setUpFunc(...args){
        // set up data with ...args
    }
    __cleanUpFunc(){

    }

    return [$main,__setUpFunc,__cleanUpFunc]
}
// _ncVoucherCard.js ( non action component )
function _ncVoucherCard(...args){
    $main = NODE
    return $main
}

// -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-
// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-
function baseSetup(){

    const state = {}

    const $main = NODE

    __sleepFunc(){} // when not use or while hide that component
    __setUpFunc(){} // when use or show that component ( especially in modal )
    __cleanUpFunc(){} // when removed component

    return [$main,__setUpFunc,__cleanUpFunc]
}
// -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-
// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-
```
