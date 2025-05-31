import { setJson, apiHandler } from '../../../helpers/api/api-handler'
import { connectToDatabase, checkDatabaseHealth } from '../../../helpers/db'
import { categoryRepo } from '../../../helpers/db-repo'

export const GET = apiHandler(
  async req => {
    const skipTest = req.nextUrl?.searchParams?.get('skip_test') === 'true'
    const testRepo = req.nextUrl?.searchParams?.get('test_repo') === 'true'
    const results = {
      server: 'ok',
      timestamp: new Date().toISOString(),
      database: null,
      categoryRepo: null,
    }

    try {
      // Basic database connectivity check
      const dbHealth = checkDatabaseHealth()

      if (skipTest) {
        // Just return the cached health status if skip_test is true
        results.database = {
          status: dbHealth.healthy ? 'ok' : 'error',
          connectionStatus: dbHealth,
          message: dbHealth.healthy
            ? 'Database connection is healthy according to cached status'
            : `Database connection is unhealthy: ${dbHealth.lastError || 'Unknown error'}`,
        }
      } else {
        // Actually test the connection with a ping
        console.log('[Health API] Testing database connection')
        try {
          const { db } = await connectToDatabase()
          const pingResult = await db.command({ ping: 1 })

          results.database = {
            status: 'ok',
            ping: pingResult,
            connectionStatus: dbHealth,
            message: 'Database connection successful',
          }
        } catch (dbError) {
          console.error('[Health API] Database connection test failed:', dbError.message)
          results.database = {
            status: 'error',
            error: dbError.message,
            connectionStatus: dbHealth,
            message: 'Failed to connect to database',
          }
        }
      }

      // Test category repository if requested
      if (testRepo) {
        console.log('[Health API] Testing category repo')
        try {
          // Get a simple count of level 0 categories
          const startTime = Date.now()
          const categories = await categoryRepo.getAll({}, { level: 0 })
          const duration = Date.now() - startTime

          results.categoryRepo = {
            status: 'ok',
            count: categories.length,
            duration: `${duration}ms`,
            message: `Retrieved ${categories.length} categories in ${duration}ms`,
          }
        } catch (repoError) {
          console.error('[Health API] Category repo test failed:', repoError.message)
          results.categoryRepo = {
            status: 'error',
            error: repoError.message,
            message: 'Failed to retrieve categories from repo',
          }
        }
      }

      // Determine overall status
      const hasError =
        results.database?.status === 'error' || results.categoryRepo?.status === 'error'
      const statusCode = hasError ? 500 : 200

      return setJson(results, statusCode)
    } catch (error) {
      console.error('[Health API] Error in health check:', error.message)
      return setJson(
        {
          status: 'error',
          message: 'Health check failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        500
      )
    }
  },
  { isJwt: false }
)

export const dynamic = 'force-dynamic'
