import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blogcraft API',
      version: '1.0.0',
      description: 'API documentation for Blogcraftproject',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          summary: '用戶登入',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: { description: '登入成功' },
            401: { description: '認證失敗' }
          }
        }
      },
      '/api/auth/me': {
        get: {
          summary: '獲取當前用戶資訊',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取用戶資訊' },
            401: { description: '未認證' }
          }
        }
      },
      '/api/site-settings': {
        get: {
          summary: '獲取網站設定',
          responses: {
            200: { description: '成功獲取設定' }
          }
        },
        put: {
          summary: '更新網站設定',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    siteName: { type: 'string' },
                    siteNameEn: { type: 'string' },
                    logo: { type: 'string' },
                    footerLogo: { type: 'string' },
                    copyright: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string' },
                    contactTime: { type: 'string' },
                    address: { type: 'string' },
                    lineQrCode: { type: 'string' },
                    socialLinks: { type: 'object' },
                    additionalLinks: { type: 'array' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        }
      },
      '/api/get-news': {
        get: {
          summary: '獲取新聞列表',
          parameters: [
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
              description: '新聞分類'
            },
            {
              name: 'isFeatured',
              in: 'query',
              schema: { type: 'boolean' },
              description: '是否為精選新聞'
            },
            {
              name: 'slug',
              in: 'query',
              schema: { type: 'string' },
              description: '新聞 slug'
            }
          ],
          responses: {
            200: { description: '成功獲取新聞列表' }
          }
        }
      },
      '/api/get-page': {
        get: {
          summary: '獲取頁面內容',
          parameters: [
            {
              name: 'slug',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: '頁面 slug'
            }
          ],
          responses: {
            200: { description: '成功獲取頁面內容' }
          }
        }
      },
      '/api/get-products': {
        get: {
          summary: '獲取產品列表',
          responses: {
            200: { description: '成功獲取產品列表' }
          }
        }
      },
      '/api/navigation': {
        get: {
          summary: '獲取導航菜單',
          responses: {
            200: { description: '成功獲取導航' }
          }
        },
        post: {
          summary: '創建導航項目',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        }
      },
      '/api/navigation/{id}': {
        get: {
          summary: '獲取特定導航項目',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取項目' }
          }
        },
        put: {
          summary: '更新導航項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除導航項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/news': {
        get: {
          summary: '獲取新聞列表（管理）',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取新聞' }
          }
        },
        post: {
          summary: '創建新聞',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        }
      },
      '/api/news/{id}': {
        get: {
          summary: '獲取特定新聞',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取新聞' }
          }
        },
        put: {
          summary: '更新新聞',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除新聞',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/pages': {
        get: {
          summary: '獲取頁面列表',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取頁面' }
          }
        },
        post: {
          summary: '創建頁面',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        }
      },
      '/api/pages/{id}': {
        get: {
          summary: '獲取特定頁面',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取頁面' }
          }
        },
        put: {
          summary: '更新頁面',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除頁面',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/dashboard/stats': {
        get: {
          summary: '獲取儀表板統計',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取統計' }
          }
        }
      },
      '/api/upload': {
        post: {
          summary: '上傳文件',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: '上傳成功' }
          }
        }
      },
      '/api/config/{key}': {
        get: {
          summary: '獲取配置項',
          parameters: [
            {
              name: 'key',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取配置' }
          }
        },
        put: {
          summary: '更新配置項',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'key',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        }
      },
      '/api/get-navigation-item': {
        get: {
          summary: '獲取導航項目',
          responses: {
            200: { description: '成功獲取導航項目' }
          }
        }
      },
      '/api/get-site-settings': {
        get: {
          summary: '獲取網站設定',
          responses: {
            200: { description: '成功獲取設定' }
          }
        }
      },
      '/api/pages/{id}/sections': {
        get: {
          summary: '獲取頁面區塊',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取區塊' }
          }
        },
        post: {
          summary: '創建頁面區塊',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        },
        put: {
          summary: '更新頁面區塊',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        }
      },
      '/api/preferences/language': {
        get: {
          summary: '獲取語言偏好',
          responses: {
            200: { description: '成功獲取語言偏好' }
          }
        },
        post: {
          summary: '設置語言偏好',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    language: { type: 'string' }
                  },
                  required: ['language']
                }
              }
            }
          },
          responses: {
            200: { description: '設置成功' }
          }
        }
      },
      '/api/tables': {
        get: {
          summary: '獲取表格列表',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取表格' }
          }
        },
        post: {
          summary: '創建表格',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        }
      },
      '/api/tables/{id}': {
        get: {
          summary: '獲取特定表格',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取表格' }
          }
        },
        put: {
          summary: '更新表格',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除表格',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/tables/{id}/rows': {
        get: {
          summary: '獲取表格行',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取行' }
          }
        },
        post: {
          summary: '創建表格行',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        },
        put: {
          summary: '更新表格行',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除表格行',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/timelines': {
        get: {
          summary: '獲取時間軸列表',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '成功獲取時間軸' }
          }
        },
        post: {
          summary: '創建時間軸',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        }
      },
      '/api/timelines/{id}': {
        get: {
          summary: '獲取特定時間軸',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取時間軸' }
          }
        },
        put: {
          summary: '更新時間軸',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除時間軸',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/timelines/{id}/items': {
        get: {
          summary: '獲取時間軸項目',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取項目' }
          }
        },
        post: {
          summary: '創建時間軸項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            201: { description: '創建成功' }
          }
        },
        put: {
          summary: '更新時間軸項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除時間軸項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      },
      '/api/timelines/{id}/items/{itemId}': {
        get: {
          summary: '獲取特定時間軸項目',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'itemId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '成功獲取項目' }
          }
        },
        put: {
          summary: '更新特定時間軸項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'itemId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            200: { description: '更新成功' }
          }
        },
        delete: {
          summary: '刪除特定時間軸項目',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'itemId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: '刪除成功' }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['src/app/api/**/*.ts'], // 掃描所有 API 路由文件
};

const swaggerSpec = swaggerJSDoc(options);

export async function GET() {
  // 生產環境不提供 Swagger 文檔
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }

  return Response.json(swaggerSpec);
}