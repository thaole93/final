import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  // Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createProduct, deleteProduct, getProducts, patchProduct } from '../api/products-api'
import Auth from '../auth/Auth'
import { Product } from '../types/Product'

interface ProductsProps {
  auth: Auth
  history: History
}

interface ProductsState {
  products: Product[]
  newProductName: string,
  releaseDate: string,
  price: number,
  currency: string,
  description: string,
  loadingProducts: boolean
}

export class Products extends React.PureComponent<ProductsProps, ProductsState> {
  constructor(props) {
    super(props);
  }

  state: ProductsState = {
    products: [],
    newProductName: '',
    releaseDate: '',
    price: 0,
    currency: 'VND',
    description: '',
    loadingProducts: true
  }

  onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('onSubmitHandler')
    e.preventDefault();
    try {
      const releaseDate = this.calculateReleaseDate()
      const newProduct = await createProduct(this.props.auth.getIdToken(), {
        name: this.state.newProductName,
        releaseDate,
        price: this.state.price,
        currency: this.state.currency,
        description: this.state.description
      })
      this.setState({
        products: [...this.state.products, newProduct],
        newProductName: ''
      })
    } catch {
      alert('Product creation failed')
    }
  }

  onEditButtonClick = (productId: string) => {
    this.props.history.push(`/products/${productId}/edit`)
  }

  onProductDelete = async (productId: string) => {
    try {
      await deleteProduct(this.props.auth.getIdToken(), productId)
      this.setState({
        products: this.state.products.filter(product => product.productId !== productId)
      })
    } catch {
      alert('Product deletion failed')
    }
  }

  onProductCheck = async (pos: number) => {
    try {
      const product = this.state.products[pos]
      await patchProduct(this.props.auth.getIdToken(), product.productId, {
        name: product.name,
        releaseDate: product.releaseDate,
        price: product.price,
        currency: product.currency,
        description: product.description,
        released: !product.released
      })
      this.setState({
        products: update(this.state.products, {
          [pos]: { released: { $set: !product.released } }
        })
      })
    } catch {
      alert('Product deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const products = await getProducts(this.props.auth.getIdToken())
      this.setState({
        products,
        loadingProducts: false
      })
    } catch (e) {
      alert(`Failed to fetch products: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">PRODUCTS</Header>

        {this.renderCreateProductInput()}

        {this.renderProducts()}
      </div>
    )
  }

  renderCreateProductInput() {
    return (
      <form onSubmit={this.onSubmitHandler}>
        <label>
          Product name
          <input
            type="text"
            name="name"
            value={this.state.newProductName}
            onChange={(e) => this.setState({ newProductName: e.currentTarget.value })}
          />
        </label><br />
        <label>
          Price
          <input
            type="number"
            name="price"
            value={this.state.price}
            onChange={(e) => this.setState({ price: parseInt(e.currentTarget.value) })}
          />
        </label><br />
        <label>
          Currency
          <input
            type="text"
            name="currency"
            value={this.state.currency}
            onChange={(e) => this.setState({ currency: e.currentTarget.value })}
          />
        </label><br />
        <label>
          Description
          <input
            type="text"
            name="description"
            value={this.state.description}
            onChange={(e) => this.setState({ description: e.currentTarget.value })}
          />
        </label><br />
        <input type="submit" value="Submit" />
      </form>
    );
  }

  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }

    return this.renderProductsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading PRODUCTS
        </Loader>
      </Grid.Row>
    )
  }

  renderProductsList() {
    return (
      <Grid padded>
        {this.state.products.map((product, pos) => {
          return (
            <Grid.Row key={product.productId}>
              <Grid.Column width={5} verticalAlign="middle">
                Product Name:
                {product.name}
              </Grid.Column>
              <Grid.Column width={5} floated="right">
                Release Date:
                {product.releaseDate}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                Released:
                <Checkbox
                  onChange={() => this.onProductCheck(pos)}
                  checked={product.released}
                />
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                Price:
                {product.price}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                Currency:
                {product.currency}
              </Grid.Column>
              <Grid.Column width={5} floated="right">
                Description:
                {product.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(product.productId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onProductDelete(product.productId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {product.productUrl && (
                <Image src={product.productUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateReleaseDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
