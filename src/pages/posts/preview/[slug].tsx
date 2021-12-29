import Head from "next/head"
import Link from "next/link"
import { GetStaticProps, GetStaticPaths } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { getPrismicClient } from "../../../services/prismic"

import styles from "../post.module.scss"

interface PostProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}


/*getStaticPaths utilizado para gerar paginas estaticas ou nao
  Posso gerar metadade das paginas estaticas (build) a outra apenas estatica com o primeiro acesso
  Esse metodo so esta disponivel com rotas parametrizadas (ex: [slug].tsx)
  Abaixo passei apenas 1 rota para ser gerada como estica no momento da build */

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          slug: "code-review-automatizado-com-danger-js"
        }
      }
    ],
    fallback: "blocking" 
    /* true, false, blocking
      true: ruim para SEO e pagina eh carregado mesmo sem nada se carregado
      false: vai tomar um 404 caso o conteudo nao exista ainda
      blocking: so quando todo conteudo tiver pronto (SSR - SSG) dai sim, vai mostrar a pagina*/
  }
}

export default function PostPreview({ post }: PostProps) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | Ignews </title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={styles.continueRead}>
            Wanna continue reading?
            <Link href="/">
              <a> Subscribe now </a>
            </Link>
            <span>😍</span>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID("publication", String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    )
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutos
  }
}
