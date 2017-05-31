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

export default class extends Component {

    constructor() {

        super()

        firebase.initializeApp(firebaseConfig)

        this.state = { data: false, key: null }
    }

    componentWillMount() {
        
        this.search()
    }

    search(key) {

        key = key || 'permadata'

        const dataRef = firebase.database().ref('datas/' + key )
        
        dataRef.once('value').then(snapshot => {

            const data = snapshot.val()

            if (data)

                this.setState({ data, key: null })

            else

                this.setState({ data: null, key })
        })
    }

    render() {

        const { key, data } = this.state

        const keywordsContainerParams = {

            itemType: 'keyword',
            items: this.state.data && this.state.data.keywords
        }

        const linksContainerParams = {

            itemType: 'link',
            items: this.state.data && this.state.data.links
        }

        const propsTypesContainers = Object.keys(PROPS_TYPES).map(prop => {

            const params = {

                key: prop,
                itemType: 'prop',
                propType: prop,
                title: PROPS_TYPES[prop],
                items: this.state.data && this.state.data.props
            }

            return <ItemsContainer { ...params } />
        })

        console.log(this.state)

        return (

            <div className="app container">

                <div className="header row">

                    <h2 className="logo four columns">permadata</h2>
                    <input type="text" className="search eight columns" placeholder="rechercher"
                            onChange={ (e) => this.search(e.target.value) } />
                </div>
                <div className="title">

                    { data && <h1>{ data.title }</h1> }

                    { (!data && key) && (
                        <div>
                            <p><b>"{ key }"</b> n'existe pas encore</p>
                            <button type="button">ajouter la page</button>
                        </div>
                    )}

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
