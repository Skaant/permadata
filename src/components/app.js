import React, { Component } from 'react'
import firebase from 'firebase'

import ItemsContainer from './items-container'

import firebaseConfig from '../firebase.config'

import '../styles/app.css'

const PROPS_TYPES = {

    context: 'contexte',
    inputs: 'intrants',
    outputs: 'extrants',
    functions: 'functions'
}

class App extends Component {

    constructor() {

        super()

        firebase.initializeApp(firebaseConfig)

        this.state = { data: false }
    }

    updateStateData(data) {

        this.setState({ data })
    }

    componentWillMount() {
        
        const self = this

        const defaultDataRef = firebase.database().ref('datas/permadata')
        
        defaultDataRef.once('value').then(snapshot => {

            if (snapshot)
                self.updateStateData(snapshot.val())
        })
    }

    search(key) {

        const dataRef = firebase.database().ref('datas/' + (key || 'permadata') )
        
        dataRef.once('value').then(snapshot => {

            if (snapshot)
                this.updateStateData(snapshot.val())
        })
    }

    render() {

        const dataId = this.state.data ? this.state.data._id : null

        const keywordsContainerParams = { dataId, itemType: 'keyword' }

        const linksContainerParams = { dataId, itemType: 'link' }

        const propsTypesContainers = Object.keys(PROPS_TYPES).map(prop => {

            const params = {
                key: prop,
                dataId,
                itemType: 'prop',
                propType: prop,
                title: PROPS_TYPES[prop]
            }

            return <ItemsContainer { ...params } />
        })

        return (

            <div className="app container">
                <div className="header row">
                    <h2 className="logo four columns">permadata</h2>
                    <input type="text" className="search eight columns" placeholder="rechercher"
                            onChange={ (e) => this.search(e.target.value) } />
                </div>
                <div className="title">
                    <h1>{ this.state.data ? this.state.data.title : 'chargement ...' }</h1>
                </div>
                <div className="content">
                    <ItemsContainer { ...keywordsContainerParams } />
                    <ItemsContainer { ...linksContainerParams } />
                    <div className="props-section">
                        { propsTypesContainers }
                    </div>
                </div>
            </div>
        )
    }
}

export default App
