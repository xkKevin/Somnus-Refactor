from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
spark = SparkSession.builder.appName('test').getOrCreate()
orders = spark.read.csv('cases/case1/orders.csv', header=True, inferSchema=True)
orders_filter_0=orders.where(orders['order_date']>='2024-01-01')
orders_filter_0_add_1=orders_filter_0.withColumn('''amount1 + amount2''',orders_filter_0['''amount1''']+orders_filter_0['''amount2'''])
orders_filter_0_add_1_biz_rename_2=orders_filter_0_add_1.withColumnRenamed('''amount1 + amount2''','''total_amount''')
subquery=orders_filter_0_add_1_biz_rename_2.select('''product_name''','''total_amount''')
subquery_filter_4=subquery.where(subquery['total_amount']>'200')
subquery_filter_4_trim_5=subquery_filter_4.withColumn('''trim(product_name)''',trim(subquery_filter_4['''product_name''']))
subquery_filter_4_trim_5_round_6=subquery_filter_4_trim_5.withColumn('''ROUND(total_amount, 1)''',round(subquery_filter_4_trim_5['''total_amount'''],1))
subquery_filter_4_trim_5_round_6_biz_rename_7=subquery_filter_4_trim_5_round_6.withColumnRenamed('''trim(product_name)''','''product''')
subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8=subquery_filter_4_trim_5_round_6_biz_rename_7.withColumnRenamed('''ROUND(total_amount, 1)''','''total_amount''')
subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8_keep_columns_9=subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8.select('''product''','''total_amount''')
subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8_keep_columns_9_order_by_10=subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8_keep_columns_9.sort('total_amount',ascending=False)
subquery_filter_4_trim_5_round_6_biz_rename_7_biz_rename_8_keep_columns_9_order_by_10.show()



