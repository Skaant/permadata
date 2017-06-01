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

                itemType: 'prop',
                propType: prop,
                title: PROPS_TYPES[prop],
                items: ( data && data.props ) && data.props[prop]
            })

            return (

                <div key={ prop } className="column notification is-primary"
                        style={ { margin: '0 5px' } }>

                    <ItemsContainer { ...params } />
                </div>
            )
        })

        return (

            <div>

                <nav className="nav">

                    <div className="nav-left">
                        
                        <div className="nav-item">
                            <h2 className="title clickable"
                                onClick={ () => window.location.replace('/') }>permadata</h2>
                        </div>
                    </div>

                    <div className="nav-center">

                        <div className="nav-item">

                            <p className="control has-icons-right">

                                <input type="text" placeholder="rechercher"
                                        className={ 'input search ' + ( searchFound ? ' is-success' : '' ) }
                                        onChange={ (e) => this.passiveSearch(e) }
                                        onKeyPress={ (e) => this.search(e) } />

                                {
                                    searchFound && (
                                        <span className="icon is-small is-right">

                                            <i className="fa fa-check"></i>
                                        </span>
                                    )
                                }
                            </p>
                        </div>
                    </div>

                    {
                        user ? (

                            <div className="nav-right">

                                <div className="nav-item">

                                    <p>salut <b>{ user.displayName.split(' ')[0].toLowerCase() }</b></p>
                                </div>
                                
                                <div className="nav-item">

                                    <button type="button" className="button"
                                            onClick={ () => firebase.auth().signOut() }>
                                        déconnexion</button>
                                </div>
                            </div>
                        ) : (

                            <div className="nav-right clickable">
                                
                                <div className="nav-item">

                                    <p><i>visiteur</i></p>
                                </div>

                                <div className="nav-item">

                                    <button type="button" className="button"
                                            onClick={ () => firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()) }>
                                        connexion</button>
                                </div>
                            </div>
                        )
                    }
                </nav>

                <div className="container">

                    <div className="notification is-primary">

                        {
                            !data && !creation && (
                                
                                <h1 className="title is-1">chargement ...</h1>
                            )
                        }

                        { 
                            data && (

                                <h1 className="title is-1">{ data.title } {

                                    ( user && data.author === user.uid ) && (

                                        <button type="button" className="delete is-medium clickable"
                                                onClick={ () => this.deleteData() }></button>
                                    )
                                }</h1>
                            )
                        }

                        { data && <ItemsContainer { ...keywordsContainerParams } /> }

                        {
                            creation && (

                                <div className="field is-grouped">

                                    <p className="control">
                                        <input type="text" className="input"
                                                placeholder={ 'titre pour la page "' + key + '"' }
                                                onChange={ (e) => this.setState({ form: { title: e.target.value }}) } />
                                    </p>

                                    <p className="control">      
                                        <button type="button" className="button"
                                                disabled={ ( !form || !form.title ) && 'disabled' }
                                                onClick={ () => this.sendForm() }>
                                            envoyer</button>
                                    </p>

                                    <p className="control">
                                        <button type="button" className="button"
                                                onClick={ () => this.setState({ form: null }) }>
                                            annuler</button>
                                    </p>
                                </div>
                            )
                        }
                    </div>

                    { 
                        data && (
                        
                            <div className="notification is-primary">
                                
                                <ItemsContainer { ...linksContainerParams } />
                            </div>
                        )
                    }
                </div>
                { 
                    data && (

                        <div className="props columns">

                            { propsTypesContainers }
                        </div>
                    )
                }
            </div>
        )
    }
}
