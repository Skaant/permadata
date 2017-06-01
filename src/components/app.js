import React, { Component } from 'react'
import firebase from 'firebase'

import ItemsContainer from './items-container'

import firebaseConfig from '../firebase.config'

import '../styles/app.css'

const PROPS_TYPES = {

    context: 'contexte',
    inputs: 'intrants',
    outputs: 'extrants',
    functions: 'fonctions'
}

export default class extends Component {

    constructor() {

        super()

        firebase.initializeApp(firebaseConfig)

        this.state = {
            user: null,
            data: null,
            key: window.location.pathname.split('/')[1] || 'permadata'
        }
    }

    componentWillMount() {

        firebase.auth().onAuthStateChanged(user => this.setState({ user }))

        firebase.auth().getRedirectResult().then(result => this.setState({ user: result.user }))

        this.refresh()
    }

    refresh() {

        const key = this.state.key

        const dataRef = firebase.database().ref('datas/' + key )
        
        dataRef.once('value').then(snapshot => {

            const data = snapshot.val()

            if (data) 
                this.setState({ data })

            else this.setState({ creation: true, form: { title: null } })
        })
    }

    passiveSearch(e) {
        
        const key = e.target.value

        if (key) {

            const dataRef = firebase.database().ref('datas/' + key)
            
            dataRef.once('value').then(snapshot => {
                
                if ( !snapshot.val() )

                    this.setState({ searchedDataMisses: true })

                else this.setState({ searchedDataMisses: null })
            })
        }
    }

    search(e) {
        
        if (e.charCode === 13) 

            window.location.assign(e.target.value)
    }

    openForm() {

        this.setState({ form: { title: null } })
    }

    sendForm() {
        
        const currentUser = firebase.auth().currentUser

        if (currentUser) {

            const { key, form: { title }} = this.state

            firebase.database().ref('/datas/'+ key ).set({

                author: currentUser.uid,
                title
            }).then(() => {

                window.location.reload()
            })
        }
    }

    deleteData() {

        const { data: { title }, key } = this.state

        if (window.confirm('voulez-vous vraiment supprimer votre page "' + title + '" [' + key + '] ?')) {

            const dataRef = firebase.database().ref('datas/' + key)
            
            dataRef.remove().then(() => window.location.assign('/'))
        }
    }

    render() {

        const { user, key, data, creation, form, searchedDataMisses } = this.state

        const commonContainerParams = {

            dataId: key,
            loaded: data !== null,
            refresh: this.refresh.bind(this)
        }

        const keywordsContainerParams = Object.assign({}, commonContainerParams, {

            itemType: 'keyword',
            title: 'mots-clés',
            items: data && data.keywords
        })

        const linksContainerParams = Object.assign({}, commonContainerParams, {

            itemType: 'link',
            title: 'relations',
            items: data && data.links
        })

        const propsTypesContainers = Object.keys(PROPS_TYPES).map(prop => {

            const params = Object.assign({}, commonContainerParams, {

                key: prop,
                itemType: 'prop',
                propType: prop,
                title: PROPS_TYPES[prop],
                items: ( data && data.props ) && data.props[prop]
            })

            return <ItemsContainer { ...params } />
        })

        return (

            <div className="app container">

                <div className="header row">

                    <h2 className="logo four columns clickable"
                            onClick={ () => window.location.replace('/') }>permadata</h2>

                    <input type="text" placeholder="rechercher"
                            className={ 'search six columns' + ( searchedDataMisses ? ' missing' : '' ) }
                            onChange={ (e) => this.passiveSearch(e) }
                            onKeyPress={ (e) => this.search(e) } />

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

                    {
                        !data && !creation && (
                            
                            <h1>chargement ...</h1>
                        )
                    }

                    { 
                        data && (

                            <h1>{ data.title } {

                                data.author === firebase.auth().currentUser.uid && (

                                    <span className="clickable"
                                            onClick={ () => this.deleteData() }>
                                        [x]</span>
                                )
                            }</h1>
                        )
                    }

                    {
                        creation && (

                            <div className="data-form row">

                                <input type="text" className="four columns"
                                        placeholder={ 'titre pour la page "' + key + '"' }
                                        onChange={ (e) => this.setState({ form: { title: e.target.value }}) } />
                                        
                                <button type="button" className="four columns"
                                        disabled={ !form.title && 'disabled' }
                                        onClick={ () => this.sendForm() }>
                                    envoyer</button>

                                <button type="button" className="four columns"
                                        onClick={ () => this.setState({ form: null }) }>
                                    annuler</button>
                            </div>
                        )
                    }
                </div>
                { 
                    !creation && (

                        <div className="content">

                            <ItemsContainer { ...keywordsContainerParams } />
                            <ItemsContainer { ...linksContainerParams } />
                            <div className="props-section">

                                { propsTypesContainers }
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}
