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
                
                if ( snapshot.val() )

                    this.setState({ searchFound: true })

                else this.setState({ searchFound: null })
            })
        }

        else this.setState({ searchFound: null })
    }

    search(e) {
        
        if (e.charCode === 13) 

            window.location.assign(e.target.value)
    }

    openForm() {

        this.setState({ form: { title: null } })
    }

    sendForm() {
        
        const user = this.state.user

        if (user) {

            const { key, form: { title }} = this.state

            firebase.database().ref('/datas/'+ key ).set({

                author: user.uid,
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

        const { user, key, data, creation, form, searchFound } = this.state

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
            items: data && data.links,
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

            <div>

                <div className="navbar primary inline-container">

                    <h2 className="logo clickable"
                            onClick={ () => window.location.replace('/') }>permadata</h2>

                    <input type="text" placeholder="rechercher"
                            className={ 'search clickable' + ( searchFound ? ' found' : '' ) }
                            onChange={ (e) => this.passiveSearch(e) }
                            onKeyPress={ (e) => this.search(e) } />

                    {
                        user ? (

                            <div className="authentication clickable"
                                    onClick={ () => firebase.auth().signOut() }>

                                <p><b>{ user.displayName }</b></p>
                                <p>déconnexion</p>
                            </div>
                        ) : (

                            <div className="authentication clickable"
                                    onClick={ () => firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()) }>
                                
                                <p><i>visiteur</i></p>
                                <p>connexion</p>
                            </div>
                        )
                    }
                </div>

                <div className="main section">

                    {
                        !data && !creation && (
                            
                            <h1>chargement ...</h1>
                        )
                    }

                    { 
                        data && (

                            <h1>{ data.title } {

                                ( user && data.author === user.uid ) && (

                                    <span className="clickable"
                                            onClick={ () => this.deleteData() }>
                                        [x]</span>
                                )
                            }</h1>
                        )
                    }

                    { data && <ItemsContainer { ...keywordsContainerParams } /> }

                    {
                        creation && (

                            <div className="data-form">

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
                    
                        <div className="links section">
                            
                            <ItemsContainer { ...linksContainerParams } />
                        </div>
                    )
                }

                { 
                    !creation && (

                        <div className="props">

                            { propsTypesContainers }
                        </div>
                    )
                }
            </div>
        )
    }
}
