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

        this.state = {
            user: null,
            data: null,
            key: null
        }
    }

    componentWillMount() {
        
        this.search()

        firebase.auth().onAuthStateChanged(user => this.setState({ user }))

        firebase.auth().getRedirectResult().then(result => this.setState({ user: result.user }))
    }

    search(key) {

        key = key || 'permadata'

        const dataRef = firebase.database().ref('datas/' + key )
        
        dataRef.once('value').then(snapshot => {

            const data = snapshot.val()

            if (data) 
                this.setState({ data, key })

            else this.setState({ data: null, key })
        })
    }

    openForm() {

        this.setState({ form: { title: null } })
    }

    sendForm() {
        
        const currentUser = firebase.auth().currentUser
        console.log(currentUser)

        if (currentUser) {

            const { key, form: { title }} = this.state

            firebase.database().ref('/datas/'+ key ).set({

                author: currentUser.uid,
                title,
                keywords: [],
                links: [],
                props: {
                    context: [],
                    inputs: [],
                    outputs: [],
                    functions: []
                }
            }).then(() => {

                this.setState({ 
                    form: null,
                    key: null
                })
                
                this.search(key)
            })
        }
    }

    deleteData() {

        const { data: { title }, key } = this.state

        console.log(title, key)

        if (window.confirm('voulez-vous vraiment supprimer votre page "' + title + '" [' + key + '] ?')) {

            const dataRef = firebase.database().ref('datas/' + key).remove().then(() => this.search())
        }
    }

    render() {

        const { user, key, data, form } = this.state

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

        return (

            <div className="app container">

                <div className="header row">

                    <h2 className="logo four columns">permadata</h2>
                    <input type="text" className="search six columns" placeholder="rechercher"
                            onChange={ (e) => this.search(e.target.value) } />

                    {
                        user ? (
                            <button type="button" title={ user.displayName }
                                    onClick={ () => firebase.auth().signOut() }>
                                deconnexion</button>                            
                        ) : (
                            <button type="button"
                                    onClick={ () => firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()) }>
                                connexion</button>
                        )
                    }
                </div>
                <div className="title">

                    { data && (
                        <h1>{ data.title } {
                            data.author === firebase.auth().currentUser.uid && <span
                                    onClick={ this.deleteData.bind(this) }>[x]</span>    
                        }</h1>
                     )}

                    { 
                        ( !data && !form && key ) && (
                            <div>
                                <p><b>"{ key }"</b> n'existe pas encore</p>
                                <button type="button"
                                        onClick={ () => this.setState({ form: { title: null }}) }>
                                    ajouter la page</button>
                            </div>
                        )
                    }

                    {
                        form && (
                            <div className="data-form row">
                                <input type="text" className="four columns"
                                        placeholder={ 'titre pour la page "' + key + '"' }
                                        onChange={ (e) => this.setState({ form: { title: e.target.value }}) } />
                                <button type="button" className="four columns"
                                        disabled={ !this.state.form.title && 'disabled' }
                                        onClick={ () => this.sendForm() }>
                                    envoyer</button>
                                <button type="button" className="four columns"
                                        onClick={ () => this.setState({ form: null }) }>
                                    annuler</button>
                            </div>
                        )
                    }

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
